'use client'
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { collection, doc, getDocs } from "firebase/firestore"
import { db } from "@/firebase"
import { useSearchParams, useRouter } from "next/navigation"
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Container, Typography, Box, Card, CardActionArea, Grid, CardContent,AppBar, Toolbar, Button } from "@mui/material"
import { Link as MuiLink } from '@mui/material';

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const searchParams = useSearchParams()
    const search = searchParams.get('id')
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function getFlashcard() {
          if (!search || !user) {
            console.error("Missing search parameter or user data");
            return;
          }
          try {
            const colRef = collection(db, `users/${user.id}/${search}`);
            const docs = await getDocs(colRef);
            const flashcards = [];
    
            docs.forEach((doc) => {
              flashcards.push({ id: doc.id, ...doc.data() });
            });
    
            setFlashcards(flashcards);
          } catch (error) {
            console.error("Error fetching flashcards:", error);
          }
        }
        getFlashcard();
      }, [user, search]);

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleLearnClick = () => {
        if (search) {
            setLoading(true); 
            router.push(`/flashcard/learn?id=${search}`);
        } else {
            console.error("No collection ID available for navigation.");
        }
    };

    if (!isLoaded || !isSignedIn) {
        return <></>
    }

    return (
        <>
        <AppBar position="static" sx={{ backgroundColor: '#212121', boxShadow: 'none' }}>
            <Container>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MuiLink href="/" sx={{ textDecoration: 'none' }}>
                    <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#fff' }}>
                        CardQuest
                    </Typography>
                </MuiLink>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SignedOut>
                            <Button color="inherit" href="/sign-in">Log In</Button>
                            <Button color="inherit" href="/sign-up" sx={{ ml: 2, borderRadius: 2 }}>Sign Up</Button>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>

        <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            href="/flashcards" 
            sx={{ padding: '12px 28px', borderRadius: 4 }}
        >
            Go Back
        </Button>

        <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            onClick = {handleLearnClick}
            sx={{ padding: '12px 28px', borderRadius: 4, }}
        >
            Learn
        </Button>

        <Container maxWidth="md" sx={{ padding: 3, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
            

            <Typography 
                variant="h4" 
                sx={{ 
                    mb: 4, 
                    fontWeight: 700, 
                    textAlign: 'center',
                    color: '#444444',
                    fontSize: '2.2rem',
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                }}
            >
                Flashcards
            </Typography>
            <Grid 
                container 
                spacing={4} 
                sx={{ 
                    mt: 3, 
                    justifyContent: 'center' 
                }}
            >
                {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                            boxShadow: 4,
                            borderRadius: 3,
                            backgroundColor: '#FFFFFF',
                            '&:hover': {
                                boxShadow: 8,
                                transform: 'scale(1.05)',
                                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                            },
                            '& .MuiCardContent-root': {
                                padding: '24px',
                            }
                        }}>
                            <CardActionArea onClick={() => handleCardClick(index)}>
                                <CardContent>
                                    <Box 
                                        sx={{
                                            perspective: '1000px',
                                            '& > div': {
                                                transition: 'transform 0.7s',
                                                transformStyle: 'preserve-3d',
                                                position: 'relative',
                                                width: '100%',
                                                height: '220px',
                                                backfaceVisibility: 'hidden',
                                                transform: flipped[index]
                                                    ? 'rotateY(180deg)'
                                                    : 'rotateY(0deg)',
                                            },
                                            '& > div > div': {
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: '24px',
                                                boxSizing: 'border-box',
                                                color: '#444444',
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                backgroundColor: '#F9F9F9',
                                            },
                                            '& > div > div:nth-of-type(2)': {
                                                transform: 'rotateY(180deg)',
                                            },
                                        }}
                                    >
                                        <div>
                                            <div>
                                                <Typography variant="h5" component="div" sx={{ fontSize: '1.3rem', fontWeight: 500 }}>
                                                    {flashcard.front}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="h5" component="div" sx={{ fontSize: '1.3rem', fontWeight: 500 }}>
                                                    {flashcard.back}
                                                </Typography>
                                            </div>
                                        </div>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>         
        </Container>
        </>
    )
}