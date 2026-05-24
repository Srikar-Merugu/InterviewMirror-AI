# InterviewMirror AI

InterviewMirror AI is a next-generation platform for conducting realistic, AI-driven mock interviews. It features a professional Zoom-style side-by-side video grid interface that pairs your real-time webcam feed with a sophisticated AI Interviewer avatar.

## 🚀 Key Features

*   **Dynamic AI Interviewer:** A fully responsive AI avatar that asks context-aware interview questions based on your target role and skills.
*   **Real-time Hardware Capture:** Seamless integration with your local webcam and microphone, streaming media directly into the chamber.
*   **Live Telemetry & Analysis:** Real-time analytics that process speech filler words, perform sentiment tracking, and evaluate behavioral cues during the interview.
*   **Anti-Cheating Mechanisms:** Includes tab-hijacking detection to ensure strict environment integrity.
*   **Comprehensive Reports:** After completing your session, access detailed, AI-generated feedback reports breaking down your performance across technical accuracy, communication style, and confidence.

## 🛠️ Technology Stack

This project is built as a modern full-stack monorepo managed by [Turborepo](https://turbo.build/repo).

*   **Frontend:** Next.js (React), Tailwind CSS, Framer Motion for animations.
*   **Backend:** Node.js, Express, Socket.io for real-time media streaming.
*   **Database:** MongoDB, integrated seamlessly via Prisma ORM.
*   **Core Languages:** Fully typed with TypeScript.

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
*   [npm](https://www.npmjs.com/)
*   A running instance of [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Srikar-Merugu/InterviewMirror-AI.git
    cd InterviewMirror-AI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    *   Set up your `.env` files in both the `apps/backend/` and `packages/database/` directories.
    *   Make sure your `DATABASE_URL` is pointing to your MongoDB instance (e.g., `mongodb://localhost:27017/interviewmirror`).

4.  **Database Migration:**
    ```bash
    npx prisma db push
    ```

5.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    This command will spin up all workspace packages simultaneously using Turborepo.

6.  **Access the Application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Srikar-Merugu/InterviewMirror-AI/issues).

## 📄 License

This project is licensed under the MIT License.