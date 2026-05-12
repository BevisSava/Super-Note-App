import axios from 'axios';

const API_URL = 'http://localhost:8080/index.php';
export const BACKEND_URL = 'http://localhost:8080';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};
export const loginAPI = async (email, password) => {
    const response = await axios.post(`${API_URL}?action=login`, { email, password });
    return response.data;
};
export const registerAPI = async (email, displayName, password, confirmPassword) => {
    const response = await axios.post(`${API_URL}?action=register`, {
        email, 
        display_name: displayName, 
        password, 
        confirm_password: confirmPassword
    });
    return response.data;
};
export const forgotPasswordAPI = async (email) => {
    const response = await axios.post(`${API_URL}?action=forgot_password`, { email });
    return response.data;
};
export const resetPasswordAPI = async (token, new_password, confirm_password) => {
    const response = await axios.post(`${API_URL}?action=reset_password`, { token, new_password, confirm_password });
    return response.data;
};
export const getNotesAPI = async () => {
    const response = await axios.get(`${API_URL}?action=get_notes`, getAuthHeader());
    return response.data;
};
export const createNoteAPI = async (formData) => {
    const response = await axios.post(`${API_URL}?action=create_note`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeader().headers
        }
    });
    return response.data
};
export const deleteNoteAPI = async (id) => {
    const response = await axios.post(`${API_URL}?action=delete_note`, { note_id: id }, getAuthHeader());
    return response.data;
};
export const updateNoteAPI = async (formData) => {
    const response = await axios.post(`${API_URL}?action=update_note`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeader().headers
        }
    });
    return response.data;
};
export const lockNoteAPI = async (note_id, password) => {
    const response = await axios.post(`${API_URL}?action=set_password`, { note_id, password }, getAuthHeader());
    return response.data;
};
export const unlockNoteAPI = async (note_id, password) => {
    const response = await axios.post(`${API_URL}?action=unlock_note`, { note_id, password }, getAuthHeader());
    return response.data;
};

export const changeColorAPI = async (id, color) => {
    const response = await axios.post(`${API_URL}?action=change_color`, { id, color }, getAuthHeader());
    return response.data;
};
export const togglePinAPI = async (id, is_pinned) => {
    const response = await axios.post(`${API_URL}?action=toggle_pin`, { id, is_pinned }, getAuthHeader());
    return response.data;
};
export const shareNoteAPI = async (id, email, permission = 'read') => {
    const response = await axios.post(`${API_URL}?action=share_note`, { 
        note_id: id, 
        email: email,
        permission: permission 
    }, getAuthHeader());
    return response.data;
};
export const getProfileAPI = async () => {
    return await axios.get(`${API_URL}?action=get_profile`, getAuthHeader());
};

export const updateProfileAPI = async (formData) => {
    return await axios.post(`${API_URL}?action=update_profile`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeader().headers
        }
    });
};
export const getLabelsAPI = async () => {
    return await axios.get(`${API_URL}?action=get_labels`, getAuthHeader());
};

export const createLabelAPI = async (name) => {
    return await axios.post(`${API_URL}?action=create_label`, { name }, getAuthHeader());
};

export const updateLabelAPI = async (id, name) => {
    return await axios.put(`${API_URL}?action=update_label`, { id, name }, getAuthHeader());
};

export const deleteLabelAPI = async (id) => {
    return await axios.delete(`${API_URL}?action=delete_label`, { 
        data: { id },
        ...getAuthHeader()
    });
};