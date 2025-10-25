const BASE_URL = "https://dumppp-api1.onrender.com";
// const BASE_URL = "https://localhost:5000";


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
    VOTE_POST: (postId: string) => BASE_URL + `/post/${postId}/vote`,
}

export const commentEndpoints = {
    CREATE_COMMENT: BASE_URL + "/comment",
    UPDATE_COMMENT: (commentId: string) => BASE_URL + `/comment/${commentId}`,
    DELETE_COMMENT: (commentId: string) => BASE_URL + `/comment/${commentId}`,
    GET_COMMENTS_BY_POST: (postId: string) => BASE_URL + `/comment/post/${postId}`,
    VOTE_COMMENT: (commentId: string) => BASE_URL + `/comment/${commentId}/vote`,
}
    
