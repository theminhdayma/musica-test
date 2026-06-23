<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ComplianceDetail } from '../../modules/compliance/types'
import { getMyComplianceDetail } from '../../modules/compliance/api'
import type {
  PricingAttributeSchema,
  PricingFormulaOverview,
  PricingPlatformListItem,
  PricingPlatformType,
  PricingTableRow,
  ProductPlatform,
  ProductPricingSummary,
  SavePricingTableBody,
} from '../../modules/pricing/types'
import {
  createMyProductPlatform,
  deleteMyProductPlatform,
  getMyProductPlatformPriceTable,
  getPricingPlatformSchema,
  listMyProductPlatforms,
  listPricingPlatforms,
  saveMyProductPlatformPriceTable,
} from '../../modules/pricing/api'
import type { MyProductDetail } from '../../modules/me-products/types'
import {
  confirmMyProductAudioUpload,
  confirmMyProductSheetMusicUpload,
  confirmMyProductThumbnailUpload,
  getMyProductDetail,
  getMyProductOriginalPlaybackUrl,
  getMyProductOriginalUploadUrl,
  getMyProductSheetMusicUploadUrl,
  getMyProductSheetMusicUrl,
  getMyProductThumbnailUploadUrl,
  getMyProductThumbnailUrl,
  replaceMyProductAllowedPermissions,
  updateMyProduct,
} from '../../modules/me-products/api'
import {
  PRODUCT_GENRE_OPTIONS,
  PRODUCT_USE_CASE_OPTIONS,
  resolveProductGenreLabel,
  resolveProductUseCaseLabel,
  type ProductGenre,
  type ProductUseCase,
} from '../../constants/products.enums'
import ArtistProductUpsertDialog from '../../components/features/products/ArtistProductUpsertDialog.vue'
import ProductWavePreview from '../../components/features/products/ProductWavePreview.vue'
import ProductPricingTableSection from '../../components/features/products/detail/ProductPricingTableSection.vue'
import PricingFormulaOverviewDialog from '../../components/features/pricing/PricingFormulaOverviewDialog.vue'

type ProductDetailSectionKey = 'general' | 'rights-license' | 'pricing'
type PricingTableDraftValue = {
  sellingPrice: string
  isActive: boolean
}

const props = defineProps<{
  productId: string
  section: string
}>()

const route = useRoute()
const router = useRouter()
const confirm = useConfirm()

const fieldClass =
  'h-10 w-full rounded-lg border bg-[color:var(--admin-surface-0)] px-4 text-sm text-[color:var(--admin-text)] outline-none transition placeholder:text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)] focus:[border-color:var(--admin-primary-500)] focus:ring-2 focus:ring-[color:var(--admin-ring)] disabled:cursor-not-allowed disabled:opacity-60'
const fileInputClass =
  'block w-full text-sm text-[color:var(--admin-text-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[color:var(--admin-primary-50)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--admin-primary-700)] hover:file:bg-[color:var(--admin-surface-2)]'
const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-[color:var(--admin-primary-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border bg-[color:var(--admin-surface-0)] px-4 py-2 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)] disabled:cursor-not-allowed disabled:opacity-60'

const validSections: ProductDetailSectionKey[] = ['general', 'rights-license', 'pricing']
const activeSection = computed<ProductDetailSectionKey>(() => {
  const section = props.section || route.params.section
  if (typeof section === 'string' && validSections.includes(section as ProductDetailSectionKey)) {
    return section as ProductDetailSectionKey
  }
  return 'general'
})

const backToListQuery = computed(() => {
  const keys = ['page', 'pageSize', 'keyword', 'sort', 'status', 'genre'] as const
  return keys.reduce<Record<string, string>>((result, key) => {
    const rawValue = route.query[key]
    if (typeof rawValue === 'string' && rawValue.length > 0) {
      result[key] = rawValue
    }
    return result
  }, {})
})

const selectedTrack = ref<MyProductDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const clearMessages = () => {
  errorMessage.value = null
  successMessage.value = null
}

const setError = (error: unknown) => {
  if (error instanceof Error) {
    errorMessage.value = error.message
    return
  }
  errorMessage.value = 'Có lỗi xảy ra'
}

const notifySuccess = (message: string) => {
  successMessage.value = message
  errorMessage.value = null
}

const thumbnailUrls = ref<Record<string, string>>({})
const thumbnailLoading = ref<Record<string, boolean>>({})
const originalAudioUrls = ref<Record<string, string>>({})
const originalAudioLoading = ref<Record<string, boolean>>({})

const revokeObjectUrl = (url: string | null) => {
  if (!url) return
  try {
    URL.revokeObjectURL(url)
  } catch {
    return
  }
}

const fetchThumbnailUrl = async (trackId: string) => {
  if (thumbnailUrls.value[trackId] || thumbnailLoading.value[trackId]) return
  thumbnailLoading.value = { ...thumbnailLoading.value, [trackId]: true }
  try {
    const { data } = await getMyProductThumbnailUrl(trackId)
    thumbnailUrls.value = { ...thumbnailUrls.value, [trackId]: data.thumbnailUrl }
  } finally {
    thumbnailLoading.value = { ...thumbnailLoading.value, [trackId]: false }
  }
}

const fetchOriginalAudioUrl = async (trackId: string) => {
  if (originalAudioUrls.value[trackId] || originalAudioLoading.value[trackId]) return
  originalAudioLoading.value = { ...originalAudioLoading.value, [trackId]: true }
  try {
    const { data } = await getMyProductOriginalPlaybackUrl(trackId)
    originalAudioUrls.value = { ...originalAudioUrls.value, [trackId]: data.playbackUrl }
  } finally {
    originalAudioLoading.value = { ...originalAudioLoading.value, [trackId]: false }
  }
}

const fetchProductDetail = async () => {
  clearMessages()
  isLoading.value = true
  try {
    const { data } = await getMyProductDetail(props.productId)
    selectedTrack.value = data
    if (data.thumbnailKey) void fetchThumbnailUrl(data.id)
    if (data.originalAudioKey) void fetchOriginalAudioUrl(data.id)
  } catch (error) {
    setError(error)
  } finally {
    isLoading.value = false
  }
}

const navigateToSection = (section: ProductDetailSectionKey) => {
  router.push({
    name: 'my-product-detail',
    params: {
      productId: props.productId,
      section,
    },
    query: route.query,
  })
}

const parseDuration = (value: string | null | undefined) => {
  if (value === undefined || value === null || value.trim().length === 0) return undefined
  const parsed = Number(value)
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return undefined
  return parsed
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatProductStatusLabel = (status: MyProductDetail['status']) => {
  if (status === 'PUBLISHED') return 'Đã phát hành'
  if (status === 'HIDDEN') return 'Đã ẩn'
  return 'Đang chờ'
}

const getProductStatusClass = (status: MyProductDetail['status']) => {
  if (status === 'PUBLISHED') return 'border-[color:var(--admin-success-200)] bg-[color:var(--admin-success-50)] text-[color:var(--admin-success-700)]'
  if (status === 'HIDDEN') return 'border-[color:var(--admin-neutral-200)] bg-[color:var(--admin-neutral-100)] text-[color:var(--admin-neutral-700)]'
  return 'border-[color:var(--admin-warning-300)] bg-[color:var(--admin-warning-50)] text-[color:var(--admin-warning-800)]'
}

const extractEventFile = (event: Event): File | null => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  return file ?? null
}

const uploadToSignedUrl = async (url: string, file: File) => {
  if (url.startsWith('mock://')) return
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  })
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }
}

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.')
  return parts.length > 1 ? String(parts[parts.length - 1] ?? '').toLowerCase() : ''
}

const ensureAudioFile = (file: File, label: string) => {
  if (!file.type.startsWith('audio/')) throw new Error(`${label} phải là file audio`)
}

const ensureImageFile = (file: File, label: string) => {
  if (!file.type.startsWith('image/')) throw new Error(`${label} phải là file hình ảnh`)
}

const ensurePdfFile = (file: File, label: string) => {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error(`${label} phải là PDF`)
  }
}

const readAudioDurationSeconds = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = url
    audio.onloadedmetadata = () => {
      const duration = audio.duration
      URL.revokeObjectURL(url)
      if (!Number.isFinite(duration) || Number.isNaN(duration)) {
        reject(new Error('Không đọc được thời lượng audio'))
        return
      }
      resolve(duration)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Không đọc được metadata audio'))
    }
  })

const openSheetMusicPdf = async (track: MyProductDetail) => {
  if (!track.sheetMusicPdfKey) return
  const { data } = await getMyProductSheetMusicUrl(track.id)
  if (data.sheetMusicUrl) {
    window.open(data.sheetMusicUrl, '_blank', 'noopener,noreferrer')
  }
}

const uploadTrackAudioFile = async (productId: string, file: File) => {
  ensureAudioFile(file, 'Audio gốc')
  const signed = await getMyProductOriginalUploadUrl(productId)
  await uploadToSignedUrl(signed.data.uploadUrl, file)
  const confirmed = await confirmMyProductAudioUpload(productId, { mode: 'original', fileKey: signed.data.fileKey })
  const nextOriginalUrls = { ...originalAudioUrls.value }
  delete nextOriginalUrls[productId]
  originalAudioUrls.value = nextOriginalUrls
  return confirmed.data as MyProductDetail
}

const uploadTrackThumbnailFile = async (productId: string, file: File) => {
  ensureImageFile(file, 'Thumbnail')
  const extension = getFileExtension(file.name) as 'png' | 'jpg' | 'jpeg' | 'webp'
  const signed = await getMyProductThumbnailUploadUrl(productId, { extension })
  await uploadToSignedUrl(signed.data.uploadUrl, file)
  const confirmed = await confirmMyProductThumbnailUpload(productId, { fileKey: signed.data.fileKey })
  const nextThumbnailUrls = { ...thumbnailUrls.value }
  delete nextThumbnailUrls[productId]
  thumbnailUrls.value = nextThumbnailUrls
  return confirmed.data as MyProductDetail
}

const uploadTrackSheetMusicFile = async (productId: string, file: File) => {
  ensurePdfFile(file, 'PDF khuông nhạc')
  const signed = await getMyProductSheetMusicUploadUrl(productId)
  await uploadToSignedUrl(signed.data.uploadUrl, file)
  const confirmed = await confirmMyProductSheetMusicUpload(productId, { fileKey: signed.data.fileKey })
  return confirmed.data as MyProductDetail
}

const editDialogVisible = ref(false)
const editDialogErrorMessage = ref<string | null>(null)
const editForm = reactive({
  title: '',
  authorName: '',
  genres: [] as ProductGenre[],
  useCases: [] as ProductUseCase[],
  description: '',
  duration: '',
})
const editOriginalFile = ref<File | null>(null)
const editSheetMusicFile = ref<File | null>(null)
const editThumbnailFile = ref<File | null>(null)
const editThumbnailUrl = ref<string | null>(null)
const editOriginalAudioUrl = ref<string | null>(null)

const editDurationDisplay = computed(() => {
  const parsed = parseDuration(editForm.duration)
  return parsed === undefined ? null : formatDuration(Math.max(0, Math.round(parsed)))
})

const clearEditDialogError = () => {
  editDialogErrorMessage.value = null
}

const openEditDialog = async () => {
  if (!selectedTrack.value) return
  clearMessages()
  clearEditDialogError()
  editOriginalFile.value = null
  editSheetMusicFile.value = null
  editThumbnailFile.value = null
  revokeObjectUrl(editThumbnailUrl.value)
  revokeObjectUrl(editOriginalAudioUrl.value)
  editThumbnailUrl.value = null
  editOriginalAudioUrl.value = null

  editForm.title = selectedTrack.value.title ?? ''
  editForm.authorName = selectedTrack.value.authorName ?? ''
  editForm.genres = (selectedTrack.value.genres ?? []) as ProductGenre[]
  editForm.useCases = (selectedTrack.value.useCases ?? []) as ProductUseCase[]
  editForm.description = selectedTrack.value.description ?? ''
  editForm.duration = String(selectedTrack.value.duration ?? '')

  editDialogVisible.value = true

  if (selectedTrack.value.originalAudioKey) {
    try {
      await fetchOriginalAudioUrl(selectedTrack.value.id)
      editOriginalAudioUrl.value = originalAudioUrls.value[selectedTrack.value.id] ?? null
    } catch {
      editOriginalAudioUrl.value = null
    }
  }
  if (selectedTrack.value.thumbnailKey) {
    try {
      await fetchThumbnailUrl(selectedTrack.value.id)
      editThumbnailUrl.value = thumbnailUrls.value[selectedTrack.value.id] ?? null
    } catch {
      editThumbnailUrl.value = null
    }
  }
}

const handleEditThumbnailFileChange = (event: Event) => {
  clearEditDialogError()
  const file = extractEventFile(event)
  editThumbnailFile.value = file
  revokeObjectUrl(editThumbnailUrl.value)
  editThumbnailUrl.value = file ? URL.createObjectURL(file) : null
}

const handleEditAudioFileChange = async (event: Event) => {
  clearEditDialogError()
  const file = extractEventFile(event)
  editOriginalFile.value = file
  revokeObjectUrl(editOriginalAudioUrl.value)
  editOriginalAudioUrl.value = file ? URL.createObjectURL(file) : null
  if (!file) return
  try {
    ensureAudioFile(file, 'Audio gốc')
    const duration = await readAudioDurationSeconds(file)
    editForm.duration = String(Math.max(0, Math.round(duration)))
  } catch (error) {
    editDialogErrorMessage.value = error instanceof Error ? error.message : 'Không đọc được thời lượng audio'
  }
}

const handleEditSheetMusicFileChange = (event: Event) => {
  clearEditDialogError()
  editSheetMusicFile.value = extractEventFile(event)
}

const submitEdit = async () => {
  if (!selectedTrack.value) return
  clearMessages()
  clearEditDialogError()
  isLoading.value = true

  try {
    const duration = parseDuration(editForm.duration)
    const updatePayload = {
      title: editForm.title,
      authorName: editForm.authorName,
      genres: editForm.genres,
      useCases: editForm.useCases,
      description: editForm.description,
      duration: duration === undefined ? undefined : Math.max(0, Math.round(duration)),
    }

    await updateMyProduct(selectedTrack.value.id, updatePayload)

    const uploadJobs: Array<{ type: 'audio' | 'thumbnail' | 'sheetMusic'; run: () => Promise<MyProductDetail> }> = []
    if (editOriginalFile.value) {
      uploadJobs.push({ type: 'audio', run: () => uploadTrackAudioFile(selectedTrack.value!.id, editOriginalFile.value as File) })
    }
    if (editThumbnailFile.value) {
      uploadJobs.push({ type: 'thumbnail', run: () => uploadTrackThumbnailFile(selectedTrack.value!.id, editThumbnailFile.value as File) })
    }
    if (editSheetMusicFile.value) {
      uploadJobs.push({ type: 'sheetMusic', run: () => uploadTrackSheetMusicFile(selectedTrack.value!.id, editSheetMusicFile.value as File) })
    }

    if (uploadJobs.length > 0) {
      const results = await Promise.allSettled(uploadJobs.map((job) => job.run()))
      const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
      if (rejected) throw rejected.reason
    }

    editDialogVisible.value = false
    notifySuccess('Đã cập nhật sản phẩm')
    await fetchProductDetail()
  } catch (error) {
    editDialogErrorMessage.value = error instanceof Error ? error.message : 'Không thể lưu thay đổi'
  } finally {
    isLoading.value = false
  }
}

const confirmSubmitEdit = () => {
  if (!selectedTrack.value) return
  confirm.require({
    header: 'Xác nhận lưu thay đổi',
    message: `Lưu các thay đổi cho "${selectedTrack.value.title}"?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Lưu thay đổi',
    rejectLabel: 'Huỷ',
    accept: () => void submitEdit(),
  })
}

const approvedPermissionsDialogVisible = ref(false)
const approvedPermissionsTrack = ref<MyProductDetail | null>(null)
const approvedPermissionsDetail = ref<ComplianceDetail | null>(null)
const approvedPermissionsLoading = ref(false)
const approvedPermissionsSaving = ref(false)
const selectedAllowedPermissionIds = ref<string[]>([])

const canChooseAllowedPermissions = computed(
  () =>
    approvedPermissionsDetail.value?.legalStatus === 'SUFFICIENT' &&
    approvedPermissionsDetail.value?.reviewStatus === 'APPROVED',
)

type ApprovedPermissionOption = {
  id: string
  name: string
  lawReference: string
}

const approvedPermissionOptions = computed<ApprovedPermissionOption[]>(() => {
  if (!approvedPermissionsDetail.value) return []
  return approvedPermissionsDetail.value.approvedPermissions.flatMap((permission, index) => {
    const permissionId = approvedPermissionsDetail.value?.approvedPermissionIds[index] ?? ''
    if (permissionId.length === 0) return []
    return [
      {
        id: permissionId,
        name: permission.name,
        lawReference: permission.lawReference,
      },
    ]
  })
})

const selectedApprovedPermissionCount = computed(
  () => approvedPermissionOptions.value.filter((permission) => selectedAllowedPermissionIds.value.includes(permission.id)).length,
)

const canSaveAllowedPermissions = computed(() => canChooseAllowedPermissions.value && !approvedPermissionsSaving.value)

const openApprovedPermissionsDialog = () => {
  if (!selectedTrack.value) return

  approvedPermissionsTrack.value = selectedTrack.value
  approvedPermissionsDialogVisible.value = true
  approvedPermissionsDetail.value = null
  selectedAllowedPermissionIds.value = [...(selectedTrack.value.allowedPermissionIds ?? [])]
  approvedPermissionsLoading.value = true

  void getMyComplianceDetail(selectedTrack.value.id)
    .then(({ data }) => {
      approvedPermissionsDetail.value = data
      const approvedPermissionIdSet = new Set(data.approvedPermissionIds.filter((item) => item.length > 0))
      selectedAllowedPermissionIds.value = selectedTrack.value
        ? (selectedTrack.value.allowedPermissionIds ?? []).filter((item) => approvedPermissionIdSet.has(item))
        : []
    })
    .catch((error) => {
      setError(error)
    })
    .finally(() => {
      approvedPermissionsLoading.value = false
    })
}

const toggleAllowedPermissionSelection = (permissionId: string) => {
  if (permissionId.length === 0 || approvedPermissionsSaving.value || !canChooseAllowedPermissions.value) return

  selectedAllowedPermissionIds.value = selectedAllowedPermissionIds.value.includes(permissionId)
    ? selectedAllowedPermissionIds.value.filter((item) => item !== permissionId)
    : [...selectedAllowedPermissionIds.value, permissionId]
}

const submitAllowedPermissions = async () => {
  if (!approvedPermissionsTrack.value) return

  clearMessages()
  approvedPermissionsSaving.value = true
  try {
    const { data } = await replaceMyProductAllowedPermissions(approvedPermissionsTrack.value.id, selectedAllowedPermissionIds.value)
    selectedTrack.value = data as MyProductDetail
    approvedPermissionsTrack.value = data as MyProductDetail
    selectedAllowedPermissionIds.value = [...((data as MyProductDetail).allowedPermissionIds ?? [])]
    notifySuccess('Đã cập nhật quyền bán của sản phẩm')
    await fetchProductDetail()
  } catch (error) {
    setError(error)
  } finally {
    approvedPermissionsSaving.value = false
  }
}

const confirmSaveAllowedPermissions = () => {
  if (!approvedPermissionsTrack.value || !canSaveAllowedPermissions.value) return
  confirm.require({
    header: 'Xác nhận cập nhật quyền bán',
    message: `Lưu ${selectedAllowedPermissionIds.value.length} quyền bán đã chọn cho "${approvedPermissionsTrack.value.title}"?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Lưu quyền bán',
    rejectLabel: 'Huỷ',
    accept: () => void submitAllowedPermissions(),
  })
}

type AvailablePricingPlatform = PricingPlatformListItem & {
  isEligible: boolean
  missingRequiredPermissions: PricingPlatformListItem['requiredPermissions']
}

const pricingCatalog = ref<PricingPlatformListItem[]>([])
const pricingPlatforms = ref<ProductPlatform[]>([])
const pricingSummary = ref<ProductPricingSummary | null>(null)
const pricingLoading = ref(false)
const pricingCatalogLoading = ref(false)
const pricingActionLoading = ref(false)
const selectedPricingPlatformId = ref<string | null>(null)
const pricingSchemasByType = ref<Record<string, PricingAttributeSchema[]>>({})
const pricingTablesByPlatformId = ref<Record<string, PricingTableRow[]>>({})
const pricingTableLoadingByPlatformId = ref<Record<string, boolean>>({})
const pricingTableSavingByPlatformId = ref<Record<string, boolean>>({})
const pricingTableDraftsByPlatformId = ref<Record<string, Record<string, PricingTableDraftValue>>>({})
const pricingDirtyRowKeysByPlatformId = ref<Record<string, string[]>>({})
const pricingBasePriceByPlatformId = ref<Record<string, number>>({})
const pricingWarningsByPlatformId = ref<Record<string, string[]>>({})
const pricingFormulaOverviewByPlatformId = ref<Record<string, PricingFormulaOverview | null>>({})
const pricingFormulaDialogVisible = ref(false)

const fetchPricingCatalog = async () => {
  if (pricingCatalogLoading.value) return
  pricingCatalogLoading.value = true
  try {
    const response = await listPricingPlatforms()
    pricingCatalog.value = response.data ?? []
  } finally {
    pricingCatalogLoading.value = false
  }
}

const fetchPricingPlatforms = async () => {
  if (!selectedTrack.value || pricingLoading.value) return
  pricingLoading.value = true
  try {
    const response = await listMyProductPlatforms(selectedTrack.value.id)
    pricingPlatforms.value = (response.data.items ?? []).filter((item) => !item.deletedAt)
    if (!selectedPricingPlatformId.value) {
      selectedPricingPlatformId.value = pricingPlatforms.value[0]?.id ?? null
    }
  } finally {
    pricingLoading.value = false
  }
}

const ensurePricingSchemaLoaded = async (platformType: PricingPlatformType) => {
  if (pricingSchemasByType.value[platformType]) return
  const { data } = await getPricingPlatformSchema(platformType)
  pricingSchemasByType.value = { ...pricingSchemasByType.value, [platformType]: data }
}

const fetchPricingTable = async (productPlatform: ProductPlatform | null) => {
  if (!productPlatform) return
  if (pricingTableLoadingByPlatformId.value[productPlatform.id]) return
  pricingTableLoadingByPlatformId.value = { ...pricingTableLoadingByPlatformId.value, [productPlatform.id]: true }
  try {
    await ensurePricingSchemaLoaded(productPlatform.platformType as PricingPlatformType)
    const response = await getMyProductPlatformPriceTable(productPlatform.id)
    const rows = response.data.items ?? []
    pricingTablesByPlatformId.value = { ...pricingTablesByPlatformId.value, [productPlatform.id]: rows }
    pricingBasePriceByPlatformId.value = { ...pricingBasePriceByPlatformId.value, [productPlatform.id]: response.data.basePrice }
    pricingWarningsByPlatformId.value = { ...pricingWarningsByPlatformId.value, [productPlatform.id]: response.data.warnings ?? [] }
    pricingFormulaOverviewByPlatformId.value = { ...pricingFormulaOverviewByPlatformId.value, [productPlatform.id]: response.data.formulaOverview ?? null }

    pricingTableDraftsByPlatformId.value = {
      ...pricingTableDraftsByPlatformId.value,
      [productPlatform.id]: {},
    }
    pricingDirtyRowKeysByPlatformId.value = {
      ...pricingDirtyRowKeysByPlatformId.value,
      [productPlatform.id]: [],
    }
  } finally {
    pricingTableLoadingByPlatformId.value = { ...pricingTableLoadingByPlatformId.value, [productPlatform.id]: false }
  }
}

const selectedPricingPlatform = computed(() => {
  const id = selectedPricingPlatformId.value
  if (!id) return null
  return pricingPlatforms.value.find((item) => item.id === id) ?? null
})

const selectedPricingSchema = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return []
  return pricingSchemasByType.value[String(platform.platformType)] ?? []
})

const selectedPricingTableRows = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return []
  return pricingTablesByPlatformId.value[platform.id] ?? []
})

const selectedPricingDrafts = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return {}
  return pricingTableDraftsByPlatformId.value[platform.id] ?? {}
})

const selectedPricingDirtyCount = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return 0
  return pricingDirtyRowKeysByPlatformId.value[platform.id]?.length ?? 0
})

const isSelectedPricingTableLoading = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return false
  return Boolean(pricingTableLoadingByPlatformId.value[platform.id])
})

const isSelectedPricingTableSaving = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return false
  return Boolean(pricingTableSavingByPlatformId.value[platform.id])
})

const selectedPricingFormulaOverview = computed(() => {
  const platform = selectedPricingPlatform.value
  if (!platform) return null
  return pricingFormulaOverviewByPlatformId.value[platform.id] ?? null
})

const resetSelectedPricingTableDrafts = () => {
  const platform = selectedPricingPlatform.value
  if (!platform) return
  pricingTableDraftsByPlatformId.value = { ...pricingTableDraftsByPlatformId.value, [platform.id]: {} }
  pricingDirtyRowKeysByPlatformId.value = { ...pricingDirtyRowKeysByPlatformId.value, [platform.id]: [] }
}

const updatePricingDraft = (platformId: string, key: string, patch: Partial<PricingTableDraftValue>) => {
  const currentDrafts = pricingTableDraftsByPlatformId.value[platformId] ?? {}
  const existing = currentDrafts[key]
  const row = (pricingTablesByPlatformId.value[platformId] ?? []).find((item) => item.key === key)
  const base: PricingTableDraftValue =
    existing ??
    ({
      sellingPrice: row?.sellingPrice === null || row?.sellingPrice === undefined ? '' : String(row.sellingPrice),
      isActive: row?.isActive ?? true,
    } satisfies PricingTableDraftValue)

  const nextDrafts = {
    ...currentDrafts,
    [key]: { ...base, ...patch },
  }

  pricingTableDraftsByPlatformId.value = { ...pricingTableDraftsByPlatformId.value, [platformId]: nextDrafts }

  const dirtyKeys = new Set(pricingDirtyRowKeysByPlatformId.value[platformId] ?? [])
  dirtyKeys.add(key)
  pricingDirtyRowKeysByPlatformId.value = { ...pricingDirtyRowKeysByPlatformId.value, [platformId]: [...dirtyKeys] }
}

const updatePricingTableSellingPrice = (key: string, value: string) => {
  const platform = selectedPricingPlatform.value
  if (!platform) return
  updatePricingDraft(platform.id, key, { sellingPrice: value })
}

const updatePricingTableIsActive = (key: string, value: boolean) => {
  const platform = selectedPricingPlatform.value
  if (!platform) return
  updatePricingDraft(platform.id, key, { isActive: value })
}

const saveSelectedPricingTable = async () => {
  const platform = selectedPricingPlatform.value
  if (!platform) return
  const platformId = platform.id

  pricingTableSavingByPlatformId.value = { ...pricingTableSavingByPlatformId.value, [platformId]: true }
  try {
    const dirtyKeys = pricingDirtyRowKeysByPlatformId.value[platformId] ?? []
    const drafts = pricingTableDraftsByPlatformId.value[platformId] ?? {}
    const body: SavePricingTableBody = {
      items: dirtyKeys.map((key) => {
        const draft = drafts[key]
        return {
          key,
          sellingPrice: draft && draft.sellingPrice.trim().length > 0 ? Number(draft.sellingPrice) : null,
          isActive: draft ? Boolean(draft.isActive) : true,
        }
      }),
    }
    const response = await saveMyProductPlatformPriceTable(platformId, body)
    pricingTablesByPlatformId.value = { ...pricingTablesByPlatformId.value, [platformId]: response.data.items ?? [] }
    pricingFormulaOverviewByPlatformId.value = { ...pricingFormulaOverviewByPlatformId.value, [platformId]: response.data.formulaOverview ?? null }
    resetSelectedPricingTableDrafts()
    notifySuccess('Đã lưu bảng giá')
  } catch (error) {
    setError(error)
  } finally {
    pricingTableSavingByPlatformId.value = { ...pricingTableSavingByPlatformId.value, [platformId]: false }
  }
}

const availablePricingPlatforms = computed<AvailablePricingPlatform[]>(() => {
  const permissionSet = new Set(selectedTrack.value?.allowedPermissionIds ?? [])
  return pricingCatalog.value.map((platform) => {
    const missing = (platform.requiredPermissions ?? []).filter((permission) => !permissionSet.has(permission.id))
    return {
      ...platform,
      isEligible: missing.length === 0,
      missingRequiredPermissions: missing,
    }
  })
})

const joinPricingPlatform = async (platformType: PricingPlatformType) => {
  if (!selectedTrack.value) return
  pricingActionLoading.value = true
  try {
    await createMyProductPlatform(selectedTrack.value.id, { platformType })
    await fetchPricingPlatforms()
    notifySuccess('Đã thêm nền tảng')
  } catch (error) {
    setError(error)
  } finally {
    pricingActionLoading.value = false
  }
}

const removePricingPlatform = async (platformType: PricingPlatformType) => {
  if (!selectedTrack.value) return
  pricingActionLoading.value = true
  try {
    await deleteMyProductPlatform(selectedTrack.value.id, platformType)
    selectedPricingPlatformId.value = null
    await fetchPricingPlatforms()
    notifySuccess('Đã xoá nền tảng')
  } catch (error) {
    if (error instanceof Error && error.message.includes('PRODUCT_PLATFORM_NOT_FOUND')) {
      errorMessage.value = 'Nền tảng này đã bị xoá trước đó hoặc không còn tồn tại.'
      await fetchPricingPlatforms()
      return
    }
    setError(error)
  } finally {
    pricingActionLoading.value = false
  }
}

watch(
  () => selectedPricingPlatform.value?.id,
  async () => {
    const platform = selectedPricingPlatform.value
    if (!platform) return
    if (!pricingTablesByPlatformId.value[platform.id]) {
      await fetchPricingTable(platform)
    }
  },
)

watch(
  () => props.productId,
  async () => {
    await fetchProductDetail()
  },
)

watch(
  () => activeSection.value,
  (section) => {
    if (!validSections.includes(section)) {
      navigateToSection('general')
    }
  },
)

onMounted(async () => {
  await fetchProductDetail()
  await fetchPricingCatalog()
  await fetchPricingPlatforms()
})

onBeforeUnmount(() => {
  revokeObjectUrl(editThumbnailUrl.value)
  revokeObjectUrl(editOriginalAudioUrl.value)
})

const isGeneralSection = computed(() => activeSection.value === 'general')
const isRightsSection = computed(() => activeSection.value === 'rights-license')
const isPricingSection = computed(() => activeSection.value === 'pricing')
</script>

<template>
  <div class="artist-scope min-h-screen bg-[color:var(--admin-shell-bg-start)]">
    <div v-if="successMessage" class="px-4 pt-4">
      <Message severity="success" class="mx-auto w-full max-w-[1200px]">
        {{ successMessage }}
      </Message>
    </div>
    <div v-if="errorMessage" class="px-4 pt-4">
      <Message severity="error" class="mx-auto w-full max-w-[1200px]">
        {{ errorMessage }}
      </Message>
    </div>

    <div v-if="selectedTrack" class="mx-auto flex w-full max-w-[1400px] gap-0 px-4 py-6">
      <aside class="sticky top-0 hidden h-[calc(100vh-3rem)] w-[300px] shrink-0 flex-col border-r bg-[color:var(--admin-surface-0)] lg:flex" style="border-color: var(--admin-border)">
        <div class="border-b p-4" style="border-color: var(--admin-border)">
          <button
            type="button"
            class="inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--admin-surface-2)]"
            style="border-color: var(--admin-border); background: var(--admin-surface-1); color: var(--admin-text)"
            @click="router.push({ name: 'my-products', query: backToListQuery })"
          >
            <i class="pi pi-arrow-left text-xs" />
            Quay lại danh sách
          </button>
        </div>

        <div class="flex-1 px-3 py-4">
          <div class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style="color: var(--admin-text-muted)">
            Điều hướng
          </div>
          <div class="space-y-1">
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors"
              :class="activeSection === 'general' ? 'bg-[color:var(--admin-sidebar-active-bg)] text-white' : 'text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-sidebar-hover-bg)] hover:text-[color:var(--admin-text)]'"
              @click="navigateToSection('general')"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center text-base"><i class="pi pi-file-edit" /></span>
              <span class="truncate">Thông tin chung</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors"
              :class="activeSection === 'rights-license' ? 'bg-[color:var(--admin-sidebar-active-bg)] text-white' : 'text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-sidebar-hover-bg)] hover:text-[color:var(--admin-text)]'"
              @click="navigateToSection('rights-license')"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center text-base"><i class="pi pi-book" /></span>
              <span class="truncate">Quyền và giấy phép</span>
            </button>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors"
              :class="activeSection === 'pricing' ? 'bg-[color:var(--admin-sidebar-active-bg)] text-white' : 'text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-sidebar-hover-bg)] hover:text-[color:var(--admin-text)]'"
              @click="navigateToSection('pricing')"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center text-base"><i class="pi pi-calculator" /></span>
              <span class="truncate">Bảng giá</span>
            </button>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1 lg:px-8">
        <header class="rounded-[28px] border bg-[color:var(--admin-surface-0)] p-5 shadow-sm [border-color:var(--admin-border)]">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="min-w-0 truncate text-2xl font-bold text-[color:var(--admin-text)]">
                  {{ selectedTrack.title }}
                </h1>
                <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold" :class="getProductStatusClass(selectedTrack.status)">
                  {{ formatProductStatusLabel(selectedTrack.status) }}
                </span>
              </div>
              <div class="mt-1 text-sm text-[color:var(--admin-text-muted)]">
                ID: <span class="font-mono">{{ selectedTrack.id }}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" :class="secondaryButtonClass" :disabled="isLoading" @click="openEditDialog">
                <i class="pi pi-pencil mr-2" />
                Chỉnh sửa
              </button>
              <button type="button" :class="secondaryButtonClass" :disabled="isLoading || !selectedTrack.sheetMusicPdfKey" @click="openSheetMusicPdf(selectedTrack)">
                <i class="pi pi-file-pdf mr-2" />
                Mở PDF
              </button>
            </div>
          </div>
        </header>

        <section v-if="isGeneralSection" class="mt-6 space-y-6">
          <article class="rounded-[28px] border bg-[color:var(--admin-surface-0)] p-6 shadow-sm [border-color:var(--admin-border)]">
            <div class="flex flex-col gap-6">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
                Nghe thử audio gốc
              </div>
              <ProductWavePreview
                hero
                :disabled="!selectedTrack.originalAudioKey"
                :audio-url="selectedTrack.originalAudioKey ? (originalAudioUrls[selectedTrack.id] ?? null) : null"
                :track-status="selectedTrack.status"
              />
            </div>
          </article>

          <article class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-[28px] border bg-[color:var(--admin-surface-0)] p-5 shadow-sm [border-color:var(--admin-border)]">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Mô tả</div>
              <div class="mt-3 text-sm leading-7 text-[color:var(--admin-text)]">
                {{ selectedTrack.description || 'Chưa có mô tả' }}
              </div>
            </div>
            <div class="rounded-[28px] border bg-[color:var(--admin-surface-0)] p-5 shadow-sm [border-color:var(--admin-border)]">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Thuộc tính</div>
              <dl class="mt-4 grid gap-3 text-sm">
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-[color:var(--admin-text-muted)]">Tác giả</dt>
                  <dd class="text-right font-semibold text-[color:var(--admin-text)]">{{ selectedTrack.authorName || '—' }}</dd>
                </div>
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-[color:var(--admin-text-muted)]">Thể loại</dt>
                  <dd class="text-right font-semibold text-[color:var(--admin-text)]">
                    {{ (selectedTrack.genres || []).map(resolveProductGenreLabel).join(', ') || '—' }}
                  </dd>
                </div>
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-[color:var(--admin-text-muted)]">Use-case</dt>
                  <dd class="text-right font-semibold text-[color:var(--admin-text)]">
                    {{ (selectedTrack.useCases || []).map(resolveProductUseCaseLabel).join(', ') || '—' }}
                  </dd>
                </div>
                <div class="flex items-start justify-between gap-4">
                  <dt class="text-[color:var(--admin-text-muted)]">Thời lượng</dt>
                  <dd class="text-right font-semibold text-[color:var(--admin-text)]">
                    {{ typeof selectedTrack.duration === 'number' ? `${selectedTrack.duration}s` : '—' }}
                  </dd>
                </div>
              </dl>
            </div>
          </article>
        </section>

        <section v-else-if="isRightsSection" class="mt-6 space-y-6">
          <article class="rounded-[28px] border bg-[color:var(--admin-surface-0)] p-5 shadow-sm [border-color:var(--admin-border)]">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Quyền bán</div>
                <div class="mt-2 text-sm text-[color:var(--admin-text-muted)]">
                  Chọn tập quyền cuối cùng cho sản phẩm dựa trên hồ sơ pháp lý đã được duyệt.
                </div>
              </div>
              <button type="button" :class="primaryButtonClass" :disabled="isLoading" @click="openApprovedPermissionsDialog">
                <i class="pi pi-sliders-h mr-2" />
                Chọn quyền bán
              </button>
            </div>

            <div class="mt-5 rounded-xl border bg-[color:var(--admin-surface-1)] px-4 py-4 text-sm [border-color:var(--admin-border)]">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Đang chọn</div>
              <div class="mt-2 text-[color:var(--admin-text)]">
                {{ (selectedTrack.allowedPermissionIds || []).length }} quyền
              </div>
            </div>
          </article>
        </section>

        <section v-else-if="isPricingSection" class="mt-6 space-y-6">
          <article class="rounded-[28px] border bg-[color:var(--admin-surface-0)] p-5 shadow-sm [border-color:var(--admin-border)]">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Nền tảng định giá</div>
                <div class="mt-2 text-sm text-[color:var(--admin-text-muted)]">
                  Thêm nền tảng và cấu hình giá theo biến thể trước khi lên sàn.
                </div>
              </div>
              <button
                type="button"
                :class="secondaryButtonClass"
                :disabled="pricingCatalogLoading || pricingActionLoading"
                @click="fetchPricingPlatforms"
              >
                <i class="pi pi-refresh mr-2" />
                Làm mới
              </button>
            </div>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <div class="rounded-xl border bg-[color:var(--admin-surface-1)] p-4 [border-color:var(--admin-border)]">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Thêm nền tảng</div>
                <div class="mt-3 space-y-2">
                  <button
                    v-for="platform in availablePricingPlatforms"
                    :key="platform.type"
                    type="button"
                    class="flex w-full items-start justify-between gap-3 rounded-xl border bg-[color:var(--admin-surface-0)] px-4 py-3 text-left transition hover:bg-[color:var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
                    style="border-color: var(--admin-border)"
                    :disabled="!platform.isEligible || pricingActionLoading"
                    @click="joinPricingPlatform(platform.type)"
                  >
                    <div class="min-w-0">
                      <div class="font-semibold text-[color:var(--admin-text)]">{{ platform.name }}</div>
                      <div v-if="!platform.isEligible" class="mt-1 text-xs text-[color:var(--admin-danger-700)]">
                        Thiếu quyền: {{ platform.missingRequiredPermissions.map((p) => p.name).join(', ') }}
                      </div>
                    </div>
                    <i class="pi pi-plus mt-1 text-[color:var(--admin-text-muted)]" />
                  </button>
                </div>
              </div>

              <div class="rounded-xl border bg-[color:var(--admin-surface-1)] p-4 [border-color:var(--admin-border)]">
                <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Đã tham gia</div>
                <div v-if="pricingLoading" class="mt-3 rounded-xl border bg-[color:var(--admin-surface-0)] px-4 py-4 text-sm text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]">
                  Đang tải...
                </div>
                <div v-else class="mt-3 space-y-2">
                  <button
                    v-for="platform in pricingPlatforms"
                    :key="platform.id"
                    type="button"
                    class="flex w-full items-center justify-between gap-3 rounded-xl border bg-[color:var(--admin-surface-0)] px-4 py-3 text-left transition hover:bg-[color:var(--admin-surface-2)]"
                    style="border-color: var(--admin-border)"
                    @click="selectedPricingPlatformId = platform.id"
                  >
                    <div class="min-w-0">
                      <div class="font-semibold text-[color:var(--admin-text)]">{{ platform.platformName }}</div>
                      <div class="mt-1 text-xs text-[color:var(--admin-text-muted)]">
                        {{ platform.variantsCount }} biến thể
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span v-if="selectedPricingPlatformId === platform.id" class="rounded-full bg-[color:var(--admin-primary-50)] px-3 py-1 text-xs font-semibold text-[color:var(--admin-text)]">
                        Đang chọn
                      </span>
                      <button
                        type="button"
                        class="inline-flex h-9 items-center justify-center rounded-lg border bg-[color:var(--admin-surface-0)] px-3 text-sm font-semibold text-[color:var(--admin-danger-700)] transition hover:bg-[color:var(--admin-danger-50)]"
                        style="border-color: var(--admin-border)"
                        :disabled="pricingActionLoading || Boolean(platform.deletedAt)"
                        @click.stop="removePricingPlatform(platform.platformType as PricingPlatformType)"
                      >
                        <i class="pi pi-trash" />
                      </button>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </article>

          <div v-if="selectedPricingPlatform" class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="text-sm font-semibold text-[color:var(--admin-text)]">
                {{ selectedPricingPlatform.platformName }}
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" :class="secondaryButtonClass" :disabled="!selectedPricingFormulaOverview" @click="pricingFormulaDialogVisible = true">
                  <i class="pi pi-chart-line mr-2" />
                  Công thức
                </button>
              </div>
            </div>

            <ProductPricingTableSection
              :schema="selectedPricingSchema"
              :rows="selectedPricingTableRows"
              :drafts="selectedPricingDrafts"
              :loading="isSelectedPricingTableLoading"
              :saving="isSelectedPricingTableSaving"
              :dirty-count="selectedPricingDirtyCount"
              @refresh="fetchPricingTable(selectedPricingPlatform)"
              @reset="resetSelectedPricingTableDrafts"
              @save="saveSelectedPricingTable"
              @update-selling-price="updatePricingTableSellingPrice($event.key, $event.value)"
              @update-is-active="updatePricingTableIsActive($event.key, $event.value)"
            />
          </div>
        </section>
      </main>
    </div>

    <div v-else class="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div
        v-if="isLoading"
        class="rounded-xl border border-dashed bg-[color:var(--admin-surface-0)] px-6 py-16 text-center text-sm text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]"
      >
        Đang tải...
      </div>
      <div
        v-else
        class="rounded-xl border border-dashed bg-[color:var(--admin-surface-0)] px-6 py-16 text-center text-sm text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]"
      >
        Không tìm thấy sản phẩm hoặc dữ liệu chi tiết không tải được.
      </div>
    </div>

    <ArtistProductUpsertDialog
      v-model:visible="editDialogVisible"
      mode="edit"
      :is-loading="isLoading"
      :error-message="editDialogErrorMessage"
      :form="editForm"
      :field-class="fieldClass"
      :file-input-class="fileInputClass"
      :duration-display="editDurationDisplay"
      :audio-url="editOriginalAudioUrl || (selectedTrack ? (originalAudioUrls[selectedTrack.id] ?? null) : null)"
      :thumbnail-url="editThumbnailUrl || (selectedTrack ? (thumbnailUrls[selectedTrack.id] ?? null) : null)"
      :audio-file="editOriginalFile"
      :thumbnail-file="editThumbnailFile"
      :sheet-music-file="editSheetMusicFile"
      :can-open-sheet-music-pdf="Boolean(selectedTrack?.sheetMusicPdfKey)"
      @thumbnail-change="handleEditThumbnailFileChange"
      @audio-change="handleEditAudioFileChange"
      @sheet-music-change="handleEditSheetMusicFileChange"
      @open-sheet-music-pdf="selectedTrack && openSheetMusicPdf(selectedTrack)"
      @submit="confirmSubmitEdit"
    >
      <template #wavePreview="{ audioUrl }">
        <ProductWavePreview compact :audio-url="audioUrl" :disabled="!audioUrl" :track-status="selectedTrack?.status" />
      </template>
    </ArtistProductUpsertDialog>

    <PricingFormulaOverviewDialog v-model:visible="pricingFormulaDialogVisible" :formula-overview="selectedPricingFormulaOverview" />

    <Dialog
      v-model:visible="approvedPermissionsDialogVisible"
      modal
      class="w-[calc(100vw-0.75rem)] sm:w-[min(860px,96vw)]"
      :pt="{
        content: { class: 'max-h-[calc(100svh-0.75rem)] overflow-y-auto sm:max-h-[calc(100svh-8rem)]' },
        footer: { class: 'border-t px-4 py-4 sm:px-6 [border-color:var(--admin-border)]' },
      }"
    >
      <template #header>
        <div v-if="approvedPermissionsTrack" class="w-full">
          <div class="text-lg font-semibold text-[color:var(--admin-text)]">Chọn quyền bán theo hồ sơ pháp lý</div>
          <div class="mt-1 text-sm text-[color:var(--admin-text-muted)]">
            Tinh chỉnh subset quyền bán cuối cùng cho
            <span class="font-semibold text-[color:var(--admin-text)]">{{ approvedPermissionsTrack.title }}</span>.
          </div>
        </div>
      </template>

      <div class="space-y-5">
        <section
          v-if="approvedPermissionsTrack"
          class="rounded-lg border bg-[color:var(--admin-surface-1)] p-4 [border-color:var(--admin-border)]"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="font-semibold text-[color:var(--admin-text)]">{{ approvedPermissionsTrack.title }}</div>
              <div class="mt-1 text-xs text-[color:var(--admin-text-muted)]">
                Chọn quyền bán trong đúng tập được pháp lý cấp cho sản phẩm này.
              </div>
            </div>
            <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold" :class="getProductStatusClass(approvedPermissionsTrack.status)">
              {{ formatProductStatusLabel(approvedPermissionsTrack.status) }}
            </span>
          </div>
        </section>

        <section class="rounded-lg border bg-[color:var(--admin-surface-0)] p-4 [border-color:var(--admin-border)]">
          <div class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Trạng thái hồ sơ pháp lý</div>

          <div
            v-if="approvedPermissionsLoading"
            class="mt-3 rounded-xl border bg-[color:var(--admin-surface-1)] px-4 py-4 text-sm text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]"
          >
            Đang tải thông tin hồ sơ pháp lý...
          </div>

          <div v-else-if="approvedPermissionsDetail" class="mt-3 space-y-4">
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold" :class="approvedPermissionsDetail.legalStatus === 'SUFFICIENT' ? 'bg-[color:var(--admin-success-50)] text-[color:var(--admin-success-700)] [border-color:var(--admin-success-200)]' : 'bg-[color:var(--admin-warning-50)] text-[color:var(--admin-warning-800)] [border-color:var(--admin-warning-300)]'">
                Legal: {{ approvedPermissionsDetail.legalStatus }}
              </span>
              <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold" :class="approvedPermissionsDetail.reviewStatus === 'APPROVED' ? 'bg-[color:var(--admin-success-50)] text-[color:var(--admin-success-700)] [border-color:var(--admin-success-200)]' : 'bg-[color:var(--admin-warning-50)] text-[color:var(--admin-warning-800)] [border-color:var(--admin-warning-300)]'">
                Review: {{ approvedPermissionsDetail.reviewStatus }}
              </span>
            </div>

            <div v-if="!canChooseAllowedPermissions" class="rounded-xl border bg-[color:var(--admin-primary-50)] px-4 py-3 text-sm text-[color:var(--admin-text)] [border-color:var(--admin-primary-500)]">
              Chỉ có thể chọn quyền bán khi hồ sơ đang ở trạng thái `SUFFICIENT` và `APPROVED`.
            </div>

            <div v-else-if="approvedPermissionOptions.length === 0" class="rounded-xl border bg-[color:var(--admin-primary-50)] px-4 py-3 text-sm text-[color:var(--admin-text)] [border-color:var(--admin-primary-500)]">
              Hồ sơ đã đủ điều kiện nhưng hiện chưa có quyền nào trong tập `Approved permissions`.
            </div>

            <div v-else class="grid gap-4">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm font-semibold text-[color:var(--admin-text)]">
                  Đã chọn {{ selectedApprovedPermissionCount }}/{{ approvedPermissionOptions.length }}
                </div>
                <button type="button" :class="secondaryButtonClass" :disabled="approvedPermissionsSaving" @click="selectedAllowedPermissionIds = approvedPermissionOptions.map((p) => p.id)">
                  Chọn tất cả
                </button>
              </div>

              <div class="grid gap-2">
                <button
                  v-for="permission in approvedPermissionOptions"
                  :key="permission.id"
                  type="button"
                  class="flex w-full items-start justify-between gap-3 rounded-xl border bg-[color:var(--admin-surface-0)] px-4 py-3 text-left transition hover:bg-[color:var(--admin-surface-2)]"
                  style="border-color: var(--admin-border)"
                  :disabled="approvedPermissionsSaving || !canChooseAllowedPermissions"
                  @click="toggleAllowedPermissionSelection(permission.id)"
                >
                  <div class="min-w-0">
                    <div class="font-semibold text-[color:var(--admin-text)]">{{ permission.name }}</div>
                    <div class="mt-1 text-xs text-[color:var(--admin-text-muted)]">{{ permission.lawReference }}</div>
                  </div>
                  <i
                    class="pi mt-1 text-base"
                    :class="selectedAllowedPermissionIds.includes(permission.id) ? 'pi-check-circle text-[color:var(--admin-success-500)]' : 'pi-circle text-[color:var(--admin-border-strong)]'"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" :class="secondaryButtonClass" @click="approvedPermissionsDialogVisible = false">Đóng</button>
          <button type="button" :class="primaryButtonClass" :disabled="!canSaveAllowedPermissions" @click="confirmSaveAllowedPermissions">
            <i v-if="approvedPermissionsSaving" class="pi pi-spin pi-spinner mr-2 text-xs" />
            Lưu quyền bán
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
