# main.py
import os
from google.cloud import bigquery
from flask import jsonify

# Initialize BigQuery client
client = bigquery.Client()

def getMuseumArtifacts(request):
    """
    HTTP Cloud Function that queries the 'artifacts' table in BigQuery.
    
    The function handles CORS headers and retrieves the project ID
    automatically from the runtime environment.
    """
    
    # 1. Handle CORS (Cross-Origin Resource Sharing)
    res = jsonify()
    res.headers['Access-Control-Allow-Origin'] = '*'
    res.headers['Access-Control-Allow-Methods'] = 'GET'
    res.headers['Access-Control-Allow-Headers'] = 'Content-Type'

    if request.method == 'OPTIONS':
        # Handle pre-flight request
        return ('', 204)

    try:
        # Get the Project ID from the environment variable 
        project_id = os.environ.get('GCP_PROJECT') or os.environ.get('PROJECT_ID')
        
        # NOTE: Column names in the CSV/BigQuery are: 
        # "Artwork ID", "Name", "Creator", "Category", "Room", "Year Created", "Description", "Image Link"
        # Since they contain spaces, they must be enclosed in backticks (` `) in the SQL query.
        query = f"""
            SELECT
                *
            FROM
                `{project_id}.museum.artifacts`
            ORDER BY 1
        """
        
        # 2. Execute the query
        query_job = client.query(query)
        results = query_job.result()
        
        # 3. Format results into a list of dictionaries
        artifacts = []
        for row in results:
            # Accessing columns by index as they are returned in order of the SELECT statement
            artifact_data = {
                "artwork_id": row[0],
                "name": row[1],
                "creator": row[2],
                "category": row[3],
                "room": row[4],
                "year_created": row[5],
                "description": row[6],
                "image_link": row[7] if row[7] else ""
            }
            artifacts.append(artifact_data)
        
        # 4. Return results as JSON
        return jsonify(artifacts)

    except Exception as e:
        print(f"Error querying BigQuery: {e}")
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500
