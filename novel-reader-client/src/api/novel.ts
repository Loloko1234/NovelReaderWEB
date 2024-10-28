import axios from "axios";

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  url: string;
  created_at: string;
}

export interface Novel {
  id: number;
  title: string;
  author: string;
  description: string;
  cover_image_url: string;
  last_chapter_number: number;
  base_url: string;
  chapters: Chapter[];
}

export const fetchNovel = async (id: number): Promise<Novel> => {
  const response = await axios.get(`http://localhost:5000/api/novels/${id}`);
  return response.data;
};

export const fetchNovels = async (): Promise<Novel[]> => {
  const response = await axios.get(`http://localhost:5000/api/novels`);
  return response.data;
};
