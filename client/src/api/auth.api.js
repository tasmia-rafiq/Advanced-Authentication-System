import api from "./axios.js";

export const register = async (payload) => {
    const { data } = await api.post("/api/v1/auth/register", payload);
    return data;
}

export const checkUsernameAvailability = async (username) => {
    const { data } = await api.get(`/api/v1/auth/check-username?username=${username}`);
    return data;
}

export const verifyEmail = async (token) => {
    const { data } = await api.post(`/api/v1/auth/verify/${token}`);
    return data;
}

export const login = async (payload) => {
    const { data } = await api.post("/api/v1/auth/login", payload);
    // setAccessToken(data.accessToken);
    return data;
}

export const forgotPassword = async (payload) => {
    const { data } = await api.post("/api/v1/auth/forgot-password", payload);
    return data;
}

export const resetPassword = async (token, payload) => {
    const { data } = await api.post(`/api/v1/auth/reset-password/${token}`, payload);
    return data;
}

export const getUser = async () => {
    const { data } = await api.get("/api/v1/auth/me");
    return data;
}

export const logout = async () => {
    const { data } = await api.post("/api/v1/auth/logout", {}, { skipAuthRefresh: true });
    return data;
}