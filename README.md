# joebangles
A degree planner that helps you organise what subjects to do when for UNSW

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
- Not sure about how to do drag and drop. Bojangles uses fabric.js and shows options when object dragged and rounds to nearest box when dropped. Surely there's a better way.
- Cards placed at top of page with form inputs like bojangles.

## Database Structure
Firebase Cload Firestore structure: [] = a collection (like an array), {} = a document (like a small object). Have chosen  Cload Firestore as Realtime Database only supports 100 simultaneous connections at free tier.
- [degrees]
  - {degreeid}
    - longname : int
    - description : string
    - usecases : int
    - [courses]
      - {courseid}
        - usecases : int
        - notusedcases : int
- [courses]
  - {courseid}
    - longname : string
    - usecases : int
    - [prereqs]
      - {prereq}
        - usecases : { usecases (int) }
        - notusedcases : { notusedcases (int) }
        - [courses]
          - {courseid}
        
## Back end functions
- Collect courses for degree
  - Search database and scrape handbook if not found
- Collect prereqs for course
  - Search database and scrape handbook if not found

## Pages being scraped
- Course: https://www.handbook.unsw.edu.au/undergraduate/courses/2019/mman2100
- Degree: https://www.handbook.unsw.edu.au/undergraduate/specialisations/2019/MTRNAH
  - Browse engineering degrees here: https://www.handbook.unsw.edu.au/undergraduate/programs/2019/3707
