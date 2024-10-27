import axios from "axios";

export interface Novel {
  id: number;
  title: string;
  author: string;
  description: string;
  last_chapter_number: number;
  base_url: string;
  cover_image_url: string;
}

export const fetchNovel = async (id: number): Promise<Novel> => {
  const response = await axios.get(`http://localhost:5000/api/novels/${id}`);
  return response.data;
};

export const fetchNovels = async (): Promise<Novel[]> => {
  console.log("Wywołanie fetchNovels");
  try {
    const response = await axios.get(`http://localhost:5000/api/novels`);
    console.log("Odpowiedź z serwera:", response.data);
    return response.data;
  } catch (error) {
    console.error("Błąd w fetchNovels:", error);
    throw error;
  }
};
