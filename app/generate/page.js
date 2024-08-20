'use client'
import { useUser } from "@clerk/nextjs"
import { collection, getDoc, writeBatch, doc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Container, TextField, Typography, Box, Paper, Button, Card, CardActionArea, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid,AppBar, Toolbar ,CardContent, CircularProgress } from "@mui/material"
import { useEffect, useState } from "react"
import { db } from "@/firebase"
import { Link as MuiLink } from '@mui/material';

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const [tier, setTier] = useState('basic')
    const [generationCount, setGenerationCount] = useState(0)
    const [upgradeMessage, setUpgradeMessage] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in')
        }
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded || !isSignedIn) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F5F7FA' }}>
                <CircularProgress color="secondary" />
            </Box>
        )
    }

    const handleSubmit = async() => {
        if (tier === 'basic' && generationCount >= 5) {
            setUpgradeMessage(true)
            return
        }

        fetch('api/generate', {
            method: 'POST',
            body: text,
        })
        .then((res) => res.json())
        .then((data) => {
            setFlashcards(data)
            if (tier === 'basic') {
                setGenerationCount(generationCount + 1)
            }
        })
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name')
            return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if (collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists.')
                return
            } else {
                collections.push({ name })
                batch.set(userDocRef, { flashcards: collections }, { merge: true })
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name }] })
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })
        await batch.commit()
        handleClose()
        router.push('/flashcards')
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

        <Container maxWidth="md" sx={{ backgroundColor: '#FBFBFB', color: '#333', padding: 3, borderRadius: '16px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{
                mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        mb: 3, 
                        fontWeight: 700, 
                        color: '#2D3748',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        fontSize: '2rem',
                        textAlign: 'center',
                        textShadow: '1px 1px 4px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    Generate Flashcards
                </Typography>
                <Paper sx={{ p: 4, width: '100%', borderRadius: '16px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', background: '#FFFFFF' }}>
                    <TextField
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        label="Enter text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{ 
                            mb: 2, 
                            backgroundColor: '#FAFAFA', 
                            borderRadius: '8px', 
                            '& .MuiOutlinedInput-root': { color: '#2D3748' },
                        }}
                    />
                    <Button
                        variant='contained'
                        color='secondary'
                        onClick={handleSubmit}
                        fullWidth
                        disabled={loading}
                        sx={{ 
                            textTransform: 'none', 
                            backgroundColor: '#6C63FF', 
                            '&:hover': { backgroundColor: '#5A55DB' },
                            borderRadius: '8px'
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
                    </Button>
                </Paper>
            </Box>
            {flashcards.length > 0 && (
                <Box sx={{ mt: 4 , display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant='h5' sx={{ mb: 2, color: '#6C63FF', fontWeight: 500, }}>
                        Flashcards Preview
                    </Typography>
                    <Grid container spacing={3}>
                        {flashcards.map((flashcard, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', backgroundColor: '#FAFAFA', borderRadius: '12px' }}>
                                    <CardActionArea onClick={() => handleCardClick(index)}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    perspective: '1000px',
                                                    '& > div': {
                                                        transition: 'transform 0.6s',
                                                        transformStyle: 'preserve-3d',
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '200px',
                                                        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
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
                                                        padding: 2,
                                                        boxSizing: 'border-box',
                                                        color: '#2D3748',
                                                        textAlign: 'center',
                                                    },
                                                    '& > div > div:nth-of-type(2)': {
                                                        transform: 'rotateY(180deg)',
                                                    },
                                                }}
                                            >
                                                <div>
                                                    <div>
                                                        <Typography variant="h6" component="div">
                                                            {flashcard.front}
                                                        </Typography>
                                                    </div>
                                                    <div>
                                                        <Typography variant="h6" component="div">
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
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button variant="contained" color="secondary" onClick={handleOpen} sx={{ textTransform: 'none', backgroundColor: '#6C63FF', '&:hover': { backgroundColor: '#5A55DB' }, borderRadius: '8px' }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            )}
            <Dialog open={open} onClose={handleClose} sx={{ '& .MuiDialog-paper': { background: '#FFFFFF', color: '#2D3748', borderRadius: '12px', padding: '16px' } }}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#4A5568' }}>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collection Name"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        variant="outlined"
                        sx={{ backgroundColor: '#FAFAFA', color: '#2D3748', borderRadius: '8px' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary" sx={{ textTransform: 'none', color: '#6C63FF' }}>
                        Cancel
                    </Button>
                    <Button onClick={saveFlashcards} variant="contained" color="secondary" sx={{ textTransform: 'none', backgroundColor: '#6C63FF', '&:hover': { backgroundColor: '#5A55DB' }, borderRadius: '8px' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={upgradeMessage}
                autoHideDuration={6000}
                onClose={() => setUpgradeMessage(false)}
                message="Upgrade to Pro to generate more flashcards."
            />
        </Container>
        </>
    )
}