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
- degrees
  - {degreeid}
    - longname : { longname (int) }
    - description : { description (string) }
    - usecases : {usecases}
    - courses
      - {courseid}
        - usecases : { usecases (int) }
        - notusedcases : { notusedcases (int) }
- courses
  - {courseid}
    - longname : { longname (string) }
    - usecases : { usecases (int) }
    - prereqs
      - { prereq (string) }
        - usecases : { usecases (int) }
        - notusedcases : { notusedcases (int) }
        
## Back end functions
- Collect courses for degree
  - Search database and scrape handbook if not found
- Collect prereqs for course
  - Search database and scrape handbook if not found

