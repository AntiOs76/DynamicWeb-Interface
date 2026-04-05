# Dynamic Web Interface to a Database System

This is an individual assignment where students demonstrate the use of HTML, CSS, JavaScript, and *MySQL*/*MongoDB* to design and implement a single-page dynamic website for a real-case application. You may use any backend server technology (e.g., *Node.js*, *Python*, *Java*, *PHP*, or *Next.js*) to connect the frontend to the database.

It is fine if you would like to use frontend libraries like *React* for this assignment, which could streamline your progress in both assignments. You are also allowed to use alternatives to the FARM stack (*FastAPI*, *React*, *MongoDB*) in both assignments.

**Project Topic**

- **Flashcard Learning App**: An application that allows users to create questions as flashcards and click to see answers. 
  - User can view a series of flashcards, each showing a question on the page.
  - User can create or delete a flashcard.
  - User can click a flashcard to reveal answer to a question. The card disappears after use.

**Requirements**

- Your app should be (or at least behave like) a **single-page application**. Ideally, there should be only one .html file used in the project, and your app should dynamically rewrite the current page with new data rather than reloading a new page from the server.
- Your app should involve **all CRUD (Create, Read, Update, Delete) operations** on a database.
-  Your app should have **a seamless and streamlined interface**. The user shouldn't experience interrupted interactions or unnecessary steps when completing a task.

| Criteria                                                     | Ratings                               | Pts    |
| ------------------------------------------------------------ | ------------------------------------- | ------ |
| Behaves like a Single-Page Application (SPA)? Yes/No. Preferably, the app should rewrite data or swap components in the current page rather than load a new HTML. If you do need multiple HTML pages, make sure there is only one main page, while all others are Modals, Drawers, pop-up windows, or floating windows. | 3 PtsFull marks0 PtsNo marks          | 3 pts  |
| Includes all CRUD Operations?Non-binary. The app's business logic should require performing all CRUD operations on a database. Deduct 1 mark for each missing operation type. | 4 to >0.0 PtsFull marks0 PtsNo marks  | 4 pts  |
| Soundness and Smoothness of Business Logic Non-binary. What to look for? 1) Is the app appropriate for this assignment (not over-simplistic or unrealistic)? 2) Does the app's workflow support the business goal? 3) Does the business logic fit intuition or industry practices? 4) Are there unnecessary steps/interfaces in the business logic? Deduct 1~2.5 marks on each aspect depending on severity and scale of the issue. | 10 to >0.0 PtsFull marks0 PtsNo marks | 10 pts |
| Overall Presentation and User Experience Non-binary. What to look for? 1) Visual Presentation: anything related to aesthetics, branding, and professional polish, including visual hierarchy, consistency, typography, and whitespace. 2) Interaction and Flow: the seamless transitions, including intuitive navigation, feedback loop (e.g., does a button change color when clicked?), and state transition (e.g., do elements slide or fade into view?). 3) Performance and Responsiveness, including initial load time, mobile responsiveness, and perceived performance. 4) Accessibility, including contrast ratios (e.g., between text and background), keyboard navigability, alt text, etc. Deduct 1~2.5 marks on each aspect depending on the severity and scale of the issue. | 10 to >0.0 PtsFull marks0 PtsNo marks | 10 pts |
| The Readme File Non-binary. What to look for? 1) A clear project title. 2) A brief summary of the problem this website solves. 3) an illustration of the technical stack, including frontend, styling, routing, data, and deployment (if applicable). 4) Feature List: a list of bullet points, such as "Responsive mobile design," "Dynamic filtering," "Dark mode toggle". 5) Briefly explain the folder structure. 6) A summary of challenges overcome: 4-5 sentences would be fine. Give 1 or 0 mark on each aspect depending on whether meaningful information is provided. A decimal mark like 0.5 is okay. | 6 to >0.0 PtsFull marks0 PtsNo marks  | 6 pts  |
| Code Quality Non-binary. What to look for? 1) Folder Structure: Are files organized logically (e.g., /components, /hooks, /services)? 2) Readability and Cleanliness, including naming conventions, consistency, and comments/documentation (e.g., are complex logic blocks explained?). 3) Error Handling and Security: Is there basic input validation? Does the screen just stay blank in API failure (e.g., when the database is down)? Deduct 1~2 marks on each aspect depending on the severity and scale of the issue. | 6 to >0.0 PtsFull marks0 PtsNo marks  | 6 pts  |
| In-person Q&A Yes/No. 1 mark to students who can answer tutors' questions regarding their Assignment 1 submissions well in tutorial classes. | 1 PtsFull marks0 PtsNo marks          | 1 pts  |

Total points: 40