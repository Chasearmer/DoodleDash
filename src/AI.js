import OpenAI from "openai";
import { config } from "./config.js";
const openai = new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true});

export const guessWordFromImage = async (imageURL, guesses) => {
    const start_time = Date.now()
    const input_message = `You are playing DoodleDash. Your job is to guess what word is being drawn. Respond with only your guess, which should be one word. If you are unsure about the guess, end with a question mark. If you are confident, end with an exclamation mark! Otherwise, end with an exclamation mark! If the canvas is blank, respond 'Nothing'. For context, here is what you have guessed so far: ${guesses?.join(', ')}. Don't repeat your previous guesses -- try something new!`;
    console.log("Input Message:\n"+input_message)
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: input_message},
            {
              type: "image_url",
              image_url: {
                "url": imageURL
              },
            },
          ],
        },
      ],
    });

    const guessedWord = response.choices[0]["message"]["content"];
    console.log(`👀Guessing time: ${Date.now() - start_time}ms, 🎯Guessed Word: ${guessedWord}`);
    return guessedWord;
  };

export const generateAudio = async (text) => {
    const start_time = Date.now()
    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "fable",
        input: text,
      });

      // Directly use the ArrayBuffer response to create a Blob
      const blob = new Blob([await response.arrayBuffer()], { type: 'audio/mp3' });
      console.log(`🗣️Speaking Time: ${Date.now() - start_time}`)

      // Create an object URL for the Blob
      return URL.createObjectURL(blob);
    
    } catch (error) {
        console.error('Error fetching or playing speech:', error);
      }
    };


export const generateRecap = async (gameHistory) => {
    const gameSummary = gameHistory.map(entry => {
      let outcomeText = '';
      switch (entry.outcome) {
        case 'completed':
          outcomeText = `successfully drew '${entry.word}' in ${entry.timeTaken}s`;
          break;
        case 'skipped':
          outcomeText = `skipped '${entry.word}' after ${entry.timeTaken}s`;
          break;
        case 'incomplete':
          outcomeText = `didn't complete '${entry.word}' in time after ${entry.timeTaken}s`;
          break;
        default:
          outcomeText = `played '${entry.word}'`;
      }
      return outcomeText;
      }).join(', ');
    const input_message = `You just finished playing Doodle Dash, a game where the human is given a word to draw and you (the AI) have to guess it. You and the human both work together to guess as many words as you can within the time limit. Here are the results of the game you just finished together: ${gameSummary}. Your task is to write a end-game message to the player based on the results. If the player scored very low (0-3 points), you should write something sassy. If the player does well (4-5 points) you should say a celebratory message of camaraderie. If the player does exception (7+ points), you should give extra congratulatory statement. Your response will be extra good if you weave in a reference to the words in the game, (especially standout words that were very slow or fast). Also, a good pun is always appreciated! The final sentence should be a request/question/comment about playing again. Your response should only be 2-3 sentences (plus the final sentence about playing another round).`
    console.log("Input Message:\n"+input_message)
    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: input_message}]
        },
      ],
    });

    const recap = response.choices[0]["message"]["content"];
    console.log("🧠 Recap: " + recap);
    return recap;
}