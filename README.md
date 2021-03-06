# joebangles
A degree planner that helps you organise what subjects to do when for UNSW. Currently in a1.0.0

## User Experience
User actions are regular points, app actions are in \* \* 
- Enter or search for degree
- \*Apply degree code\* 
- Enter courses already completed
- \*Respond with suggested courses list for degree with common subjects already selected\*
- Pick electives or pick felxible elective placeholders
- \*Calculate prereqs for choses subjects with most common already selected\*
- Select correct prereq options

## GUI
- Structured on Bootstrap (latest version)
- Single page application
- Cards placed at top of page with form inputs like bojangles.
  - Select specialisations
  - Enter completed courses
  - Pick remaining electives
- Table with courses as draggable elements for year and term containers. (dragula)

## Database Structure
Have chosen  Cload Firestore as Realtime Database only supports 100 simultaneous connections at free tier.
- degrees : collection
  - {degreeid} : doc
    - longname : int
    - usecases : int?
    - courseLevels : obj
      - {levelid} : obj
        - complusory : obj
          - {courseid} : obj
            - longname : string
            - usecases : int?
        - optionSets : array
          - {optionSetIndex} : obj
            - {courseid} : obj
              - longname : string
              - usecases : int?
- courses : coll
  - courseid : doc
    - longname : string
    - usecases : int?
    - prereqs : array
      - {prereqIndex} : obj
        - usecases : int?
        - prereq : string
    - terms : array
      - {termIndex} : obj
        - usecases : int?
        - label : string
        - terms : array
          - {term} : string
        
## Back end functions
- Collect courses for degree
  - Search database and scrape handbook if not found
- Collect prereqs for course
  - Search database and scrape handbook if not found

## Pages being scraped
- Course: https://www.handbook.unsw.edu.au/undergraduate/courses/2019/mman2100
- Degree: https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/MTRNAH
  - Browse engineering degrees here: https://www.handbook.unsw.edu.au/undergraduate/programs/2019/3707
