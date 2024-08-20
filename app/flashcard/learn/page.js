"use client";

import { useState, useEffect } from "react";
import { Container, Typography, Button, Box, Card, CardContent, CircularProgress } from "@mui/material";
import { useUser } from "@clerk/nextjs";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";

export default function Learn() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalDifficulty, setTotalDifficulty] = useState(0);
  const [totalRetries, setTotalRetries] = useState(0);
  const [totalCardsRetried, setTotalCardsRetried] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0)
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionName = searchParams.get("id");

  useEffect(() => {
    async function fetchFlashcards() {
      if (!user || !collectionName) {
        console.log("Missing user or collection name.");
        return;
      }
  
      setIsLoading(true);
  
      try {
        const colRef = collection(db, `users/${user.id}/${collectionName}`);
        const docs = await getDocs(colRef);
        const flashcardsData = docs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setFlashcards(flashcardsData);
        setStartTime(Date.now());
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchFlashcards();
  }, [user, collectionName]);

  useEffect(() => {
    if (isCompleted) {
      const endTime = Date.now();
      const timeSpent = (endTime - startTime) / 1000; 
      setElapsedTime(timeSpent);
    }
  }, [isCompleted]);
  

  const handleNext = async () => {
    if (difficulty > 1) {
      setTotalDifficulty(prevTotal => prevTotal + difficulty);
      setTotalRetries(prevRetries => prevRetries + 1);
  
      const updatedFlashcards = [...flashcards];
      const [currentCard] = updatedFlashcards.splice(currentCardIndex, 1);
      updatedFlashcards.push(currentCard);
  
      setFlashcards(updatedFlashcards);
  
      setTotalCardsRetried(prevCount => prevCount + 1);
  
      setDifficulty(0);
      setShowAnswer(false);
      setCurrentCardIndex((prevIndex) => {
        const nextIndex = prevIndex;
        return nextIndex >= updatedFlashcards.length ? 0 : nextIndex;
      });
    } else {
      setShowAnswer(false);
      setDifficulty(0);
      setCurrentCardIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= flashcards.length) {
          setIsCompleted(true); 
          return prevIndex; 
        }
        return nextIndex;
      });
    }
  };

  const passFail = (totalRetries) => {
    return totalRetries > 2 ? 'Keep Trying!' : 'You are an Expert!';
  };

  const timeEvaluation = (elapsedTime) => {
    return elapsedTime > 120 ? 'Pick up the Pace!' : 'You know your stuff!';
  };

  const handlePauseAndExit = () => {
    router.push(`/flashcards?id=${collectionName}`);
  };

  if (!isLoaded || !isSignedIn) return <></>;

  if (isLoading) {
    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading flashcards...
          </Typography>
        </Container>
    );
  }

  if (isCompleted) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          You have completed the set. Congratulations!
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Time Spent: {elapsedTime.toFixed(2)} seconds
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Time Evaluation: {timeEvaluation(elapsedTime)}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Number of Cards Retried: {totalCardsRetried}
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Your Result: {passFail(totalRetries)}
        </Typography>
        <Button variant="contained" onClick={() => router.push("/flashcards")} sx={{ mt: 2 }}>
          Go Back to Flashcards
        </Button>
      </Container>
    );
  }
  

  if (flashcards.length === 0) {
    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h5">No flashcards available.</Typography>
          <Button variant="contained" onClick={() => router.push("/flashcards")} sx={{ mt: 2 }}>
            Go Back to Flashcards
          </Button>
        </Container>
    );
  }

  if (currentCardIndex >= flashcards.length) {
    return (
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h5">Review Complete!</Typography>
          <Button variant="contained" onClick={() => router.push("/flashcards")} sx={{ mt: 2 }}>
            Go Back to Flashcards
          </Button>
        </Container>
    );
  }

  const currentCard = flashcards[currentCardIndex];

  return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">
          Card {currentCardIndex + 1} of {flashcards.length}
        </Typography>

        <Card
          onClick={() => setShowAnswer(true)}
          sx={{
            mt: 4,
            boxShadow: 3,
            cursor: "pointer",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          <CardContent>
            <Typography variant="h5">
              {showAnswer ? currentCard.back : currentCard.front}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4 }}>
          {showAnswer && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Rate Difficulty:
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                {[1, 2, 3].map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? "contained" : "outlined"}
                    onClick={() => setDifficulty(level)}
                    sx={{ mx: 1 }}
                  >
                    {level}
                  </Button>
                ))}
              </Box>
            </>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            sx={{ mt: 4, width: "100%" }}
            disabled={!showAnswer || !difficulty}
          >
            Next Card
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handlePauseAndExit}
            sx={{ mt: 2, width: "100%" }}
          >
            Exit
          </Button>
        </Box>
      </Container>
  );
}