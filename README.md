# Hari

Improve your HR process 

## Configuration 
To use OpenAI you need to define following variable 
`OPENAI_API_KEY='secret'`

to use AzureOpenAI define 
`USE_AZURE=true`
`AZURE_OPENAI_API_KEY='secret'`


## Setup

1. Use nvm to setup LTS nodejs (18.16.0) `https://github.com/nvm-sh/nvm`
2. `nvm install --lts`



## DB table

+------------------------------------------------+
|                    Resume                      |
+------------------------------------------------+
| - resume_id: INT (Primary Key)                |
| - name: VARCHAR(255)                          |
| - email: VARCHAR(255)                         |
| - raw_data: TEXT                              |
| - summary: TEXT                               |
| - technologies: JSON                          |
| - experience: JSON                            |
| - total_experience: INT                       |
| - file: BLOB                                  |
+------------------------------------------------+
