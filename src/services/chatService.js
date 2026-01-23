// Simulate Google Conversational AI Service
// In a real app, this would use fetch() to call the Dialogflow or Vertex AI API

const RESPONSES = [
    "That's a strong point using React contexts. Can you elaborate on how you handled state management scaling?",
    "I see. How did you measure the performance improvements you mentioned?",
    "Great. Now, let's switch gears. How do you handle conflict with a product manager regarding a feature deadline?",
    "Interesting approach. What would you do if the design provided is technically feasible but would hurt performance?",
    "To wrap up, do you have any questions for the team?"
];

export const sendMessageToAI = async (message) => {
    return new Promise((resolve) => {
        // Simulate network delay (1-2 seconds)
        const delay = 1000 + Math.random() * 1000;

        setTimeout(() => {
            // Pick a random response for now to simulate conversation
            const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
            resolve(response);
        }, delay);
    });
};
