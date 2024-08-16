'use client'
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { collection, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { CardActionArea, CardContent, Container, Typography, Grid, Card, AppBar, Toolbar,Box, Button } from "@mui/material"
import { Link as MuiLink } from '@mui/material';

export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return
            const docRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || []
                setFlashcards(collections)
            } else {
                await setDoc(docRef, { flashcards: [] })
            }
        }
        getFlashcards()
    }, [user])

    if (!isLoaded || !isSignedIn) {
        return <></>
    }

    const handleCardClick = (id) => {
        router.push(`flashcard?id=${id}`)
    }

    return (
        <>
        <AppBar position="static" sx={{ backgroundColor: '#212121', boxShadow: 'none' }}>
            <Container>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MuiLink href="/" sx={{ textDecoration: 'none' }}>
                    <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#fff' }}>
                        Flashcard SaaS
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

        <Container maxWidth="md" sx={{ padding: 3, backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
            <Typography 
                variant="h4" 
                sx={{ 
                    mb: 4, 
                    fontWeight: 600, 
                    textAlign: 'center',
                    color: '#333333',
                    fontSize: '2rem',
                    letterSpacing: 1,
                }}
            >
                Your Flashcards
            </Typography>
            <Grid 
                container 
                spacing={3} 
                sx={{ 
                    mt: 2, 
                    justifyContent: 'center' 
                }}
            >
                {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                            boxShadow: 3,
                            borderRadius: 2,
                            '&:hover': {
                                boxShadow: 6,
                                transform: 'scale(1.05)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                            },
                            backgroundColor: '#FFFFFF'
                        }}>
                            <CardActionArea
                                onClick={() => handleCardClick(flashcard.name)}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 500, color: '#333333' }}>
                                        {flashcard.name}
                                    </Typography>
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
