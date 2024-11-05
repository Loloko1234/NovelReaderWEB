import axios from "axios";

export interface ReadingProgress {
  novel_id: number;
  current_page: number;
  last_read_at: string;
  title: string;
  cover_image_url: string;
}

const API_BASE_URL = "http://localhost:5000/api";

export const getUserProgress = async (): Promise<ReadingProgress[]> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateReadingProgress = async (
  novelId: number,
  currentPage: number
) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/progress`,
    { novelId, currentPage },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
