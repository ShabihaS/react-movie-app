import { Client, Databases, Query ,ID} from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLES_ID = import.meta.env.VITE_APPWRITE_TABLES_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;


const client=new Client()
.setEndpoint('https://syd.cloud.appwrite.io/v1') // Your Appwrite Endpoint
.setProject(PROJECT_ID); // Project ID

const databases = new Databases(client);



export const updateSearchCount=async(searchTerm, movie)=>{

    //1.Appwrite SDK to check if the search Term exits in the database
    try {
        const result=await databases.listDocuments(DATABASE_ID, TABLES_ID, [
            Query.equal("searchTerm", searchTerm)
        ]);
        //2, If it exists, increment the count

        if(result.documents.length>0){
            const doc=result.documents[0];

            await databases.updateDocument(DATABASE_ID, TABLES_ID, doc.$id, {
                count: doc.count + 1,
            })

            //3. If it does not exist, create a new record with count 1
        }else{
            await databases.createDocument(DATABASE_ID, TABLES_ID, ID.unique(), {
                searchTerm: searchTerm,
                count: 1,
                movie_id: movie.id ,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });

        }

    }catch (error) {
        console.error("Error updating search count:", error);
    }
    
    


}

export const getTrendingMovies=async()=>{
    try {
        const result=await databases.listDocuments(DATABASE_ID, TABLES_ID, [
            Query.orderDesc("count"),
            Query.limit(5)
        ]);

        return result.documents;

    }catch (error) {
        console.error("Error getting trending movies:", error);
    }

}



