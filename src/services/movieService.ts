import axios from 'axios';
import { API_KEY, MOVIE_BASE_URL } from '../constants/api';
import { 
  Movie, 
  MovieDetails, 
  Cast, 
  Recommendation, 
  SearchResult, 
  SearchResponse 
} from '../models/Movie';

const api = axios.create({
  baseURL: MOVIE_BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

// Popüler filmleri getir
export const getPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await api.get('/movie/popular', {
      params: { page }
    });
    return response.data.results;
  } catch (error) {
    console.error('Popüler filmleri getirirken hata:', error);
    throw error;
  }
};

// En iyi filmleri getir
export const getTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await api.get('/movie/top_rated', {
      params: { page }
    });
    return response.data.results;
  } catch (error) {
    console.error('En iyi filmleri getirirken hata:', error);
    throw error;
  }
};

// Film detaylarını getir
export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  try {
    const response = await api.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Film detaylarını getirirken hata:', error);
    throw error;
  }
};

// Film önerilerini getir
export const getMovieRecommendations = async (movieId: number): Promise<Recommendation[]> => {
  try {
    const response = await api.get(`/movie/${movieId}/recommendations`);
    return response.data.results;
  } catch (error) {
    console.error('Film önerilerini getirirken hata:', error);
    throw error;
  }
};

// Film oyuncularını getir
export const getMovieCast = async (movieId: number): Promise<Cast[]> => {
  try {
    const response = await api.get(`/movie/${movieId}/credits`);
    return response.data.cast;
  } catch (error) {
    console.error('Film oyuncularını getirirken hata:', error);
    throw error;
  }
};

// Film ara
export const searchMovies = async (query: string, page: number = 1): Promise<SearchResult[]> => {
  try {
    const response = await api.get('/search/movie', {
      params: { query, page }
    });
    return response.data.results;
  } catch (error) {
    console.error('Film ararken hata:', error);
    throw error;
  }
};

// Film arama bilgilerini getir (sayfalama dahil)
export const getSearchMovieInfo = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await api.get('/search/movie', {
      params: { query, page }
    });
    return response.data;
  } catch (error) {
    console.error('Film arama bilgilerini getirirken hata:', error);
    throw error;
  }
};

// Rastgele film getir (popüler filmlerden)
export const getRandomMovie = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await api.get('/movie/popular', {
      params: { page }
    });
    return response.data.results;
  } catch (error) {
    console.error('Rastgele film getirirken hata:', error);
    throw error;
  }
}; 