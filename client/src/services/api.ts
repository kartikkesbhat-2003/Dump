const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// AUTH ENDPOINTS
export const authEndpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  GET_CURRENT_USER: BASE_URL + `/auth/me`
};

export const postEndpoints = {
    CREATE_POST: BASE_URL + "/post",
    GET_ALL_POSTS: BASE_URL + "/post",
    GET_POST_BY_ID: (postId: string) => BASE_URL + `/post/${postId}`,
    DELETE_POST: (postId: string) => BASE_URL + `/post/${postId}`,
    UPDATE_POST: (postId: string) => BASE_URL + `/post/${postId}`,
  GET_POSTS_BY_USER: BASE_URL + `/post/user/me`,
  GET_POSTS_BY_USER_ID: (userId: string) => BASE_URL + `/post/user/${userId}`,
    VOTE_POST: (postId: string) => BASE_URL + `/post/${postId}/vote`,
}

export const commentEndpoints = {
    CREATE_COMMENT: BASE_URL + "/comment",
    UPDATE_COMMENT: (commentId: string) => BASE_URL + `/comment/${commentId}`,
    DELETE_COMMENT: (commentId: string) => BASE_URL + `/comment/${commentId}`,
    GET_COMMENTS_BY_POST: (postId: string) => BASE_URL + `/comment/post/${postId}`,
    VOTE_COMMENT: (commentId: string) => BASE_URL + `/comment/${commentId}/vote`,
}

export const notificationEndpoints = {
  GET_NOTIFICATIONS: BASE_URL + '/notification',
  GET_COUNT: BASE_URL + '/notification/count',
  MARK_AS_READ: (id: string) => BASE_URL + `/notification/${id}/read`,
  MARK_ALL_READ: BASE_URL + '/notification/mark-all'
}

export const userEndpoints = {
  GET_PUBLIC_PROFILE: (userId: string) => BASE_URL + `/user/public/${userId}`,
}
    
