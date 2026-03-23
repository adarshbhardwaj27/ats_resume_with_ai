import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const analyzeResume = async (latex, jobDescription) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/analyze`, {
            latex,
            jobDescription,
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to analyze resume');
        } else if (error.request) {
            throw new Error('No response from server. Is the backend running?');
        } else {
            throw new Error(error.message || 'Error analyzing resume');
        }
    }
};
