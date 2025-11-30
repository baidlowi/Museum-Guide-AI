
import { Artifact } from '../types';
import { ARTIFACS as LOCAL_DATA } from '../constants';

// Configuration for your Backend API (Cloud Function connected to BigQuery)
const API_URL = "https://getmuseumartifacts-uvcngnj5wq-uc.a.run.app";

/**
 * Fetches museum artifact data.
 * 
 * Strategy:
 * 1. Checks if an API URL is configured.
 * 2. If configured, tries to fetch from BigQuery API.
 * 3. Maps the flat DB structure to the nested Artifact interface.
 * 4. Falls back to local constants if API fails or isn't configured.
 */
export const fetchMuseumData = async (): Promise<Artifact[]> => {
  // Simulate network delay to show the loading state
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    if (!API_URL) {
      console.warn("VITE_BIGQUERY_API_URL is not set. Using local backup data.");
      return LOCAL_DATA;
    }

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`BigQuery API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    console.log("✅ Data loaded from BigQuery API");

    // Room Configuration for the 4 Quadrants
    const rooms = [
      { 
        name: 'Galeri Renaisans', // Top Left
        topBase: 25, leftBase: 25 
      },
      { 
        name: 'Galeri Nasional', // Top Right
        topBase: 25, leftBase: 75 
      },
      { 
        name: 'Aula Impresionis', // Bottom Left
        topBase: 75, leftBase: 25 
      },
      { 
        name: 'History', // Bottom Right
        topBase: 75, leftBase: 75 
      }
    ];

    // Map BigQuery snake_case fields to our frontend camelCase Artifact types.
    return data.map((item: any, index: number) => {
      // Determine room based on index (Round Robin distribution)
      const roomConfig = rooms[index % 4];
      
      // Add randomness to position within the quadrant (approx +/- 10%)
      const randomOffset = (val: number) => val + (Math.random() * 14 - 7);
      
      return {
        id: item.id,
        title: item.title,
        artist: item.artist,
        year: item.year,
        period: item.period,
        description: item.description,
        imageUrl: item.image_url,
        fullDetails: item.full_details,
        
        // Default generic questions since DB doesn't have them
        suggestedQuestions: [
          "Ceritakan detail karya ini",
          "Apa makna di balik karya ini?",
          "Siapa seniman yang membuatnya?",
          "Apa fakta unik tentang ini?"
        ],
        
        // Generate positions based on the 4-quadrant layout
        mapPosition: {
          top: `${randomOffset(roomConfig.topBase)}%`, 
          left: `${randomOffset(roomConfig.leftBase)}%`,
          roomName: roomConfig.name
        }
      };
    });

  } catch (error) {
    console.warn(`⚠️ Failed to fetch from API (${API_URL}), using local backup data.`, error);
    return LOCAL_DATA;
  }
};
