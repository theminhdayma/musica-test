import { ApiError, NetworkError } from '../../shared/api/errors'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  ARTIST_GOOGLE_NOT_SUPPORTED:
    'Tài khoản Artist hiện chỉ hỗ trợ đăng nhập bằng email và mật khẩu.',
  PROVIDER_MISMATCH:
    'Phương thức đăng nhập không khớp với cách tài khoản này được tạo.',
  EMAIL_ALREADY_EXISTS:
    'Email này đã tồn tại. Vui lòng dùng email khác hoặc đăng nhập.',
  EMAIL_NOT_FOUND:
    'Không tìm thấy tài khoản với email này.',
  PASSWORD_RESET_NOT_SUPPORTED:
    'Tài khoản này không hỗ trợ quên mật khẩu bằng email và OTP.',
  INVALID_CREDENTIALS:
    'Mật khẩu không chính xác hoặc thông tin đăng nhập không hợp lệ.',
  AUTH_INSUFFICIENT_ROLE:
    'Tài khoản hiện tại không có quyền truy cập theo vai trò bạn đã chọn.',
  USER_DISABLED:
    'Tài khoản của bạn đang bị khóa hoặc tạm ngưng. Vui lòng liên hệ hỗ trợ.',
  GOOGLE_LINK_DISABLED_BY_POLICY:
    'Hệ thống hiện không cho phép liên kết thêm Google vào tài khoản email/password.',
  GOOGLE_CLIENT_NOT_CONFIGURED:
    'Google Sign-In chưa được cấu hình trên frontend. Hãy bổ sung biến môi trường Firebase trước khi dùng flow này.',
  GOOGLE_POPUP_CLOSED:
    'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.',
  GOOGLE_CLIENT_ERROR:
    'Không thể lấy thông tin đăng nhập Google trên trình duyệt này. Vui lòng thử lại.',
  OTP_VERIFICATION_INVALID:
    'Xác nhận OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.'
}

export function translateAuthErrorCode(code: string | undefined, fallback: string) {
  if (!code) return fallback
  return AUTH_ERROR_MESSAGES[code] || fallback
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return translateAuthErrorCode(error.code, error.message || fallback)
  }

  if (error instanceof NetworkError) {
    return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend hoặc mạng của bạn.'
  }

  if (error instanceof Error) {
    const code = 'code' in error ? String((error as Error & { code?: string }).code || '') : ''
    return translateAuthErrorCode(code || undefined, error.message || fallback)
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const maybeError = error as { code?: string; message?: string }
    return translateAuthErrorCode(maybeError.code, maybeError.message || fallback)
  }

  return fallback
}
