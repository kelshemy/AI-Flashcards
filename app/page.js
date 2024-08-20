'use client'
import Image from "next/image";
import getStripe from '@/utils/get-stripe';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Box, AppBar, Toolbar, Typography, Button, Grid, Paper, Container } from "@mui/material";
import Head from 'next/head';

export default function Home() {
  const handleSubmit = async (plan) => {
    try {
      const checkoutSession = await fetch('/api/checkout_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000', // change later when site is up
        },
        body: JSON.stringify({ plan }),
      });
  
      const checkoutSessionJson = await checkoutSession.json();
      if (checkoutSession.status === 500) {
        console.error(checkoutSessionJson.message);
        return;
      }
  
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });
      if (error) {
        console.warn(error.message);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
      }}
    >
      <Head>
        <title>CardQuest</title>
        <meta name="description" content="Create flashcards from your text" />
      </Head>

      <AppBar position="static" sx={{ backgroundColor: '#212121', boxShadow: 'none' }}>
        <Container>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#fff' }}>
              CardQuest
            </Typography>
            <SignedOut>
              <Button color="inherit" href="/sign-in">Log In</Button>
              <Button color="inherit" href="/sign-up" sx={{ ml: 2, borderRadius: 2 }}>Sign Up</Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, mt: 4 }}>
      <Box 
        sx={{
          textAlign: 'center',
          p: 4,
          backgroundColor: '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'translateY(-8px)',
          }
        }}
      >
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Welcome to CardQuest
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, color: '#666' }}>
          The easiest way to make flashcards from your text!
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            href="/generate" 
            sx={{ padding: '12px 28px', borderRadius: 4, backgroundColor: '#1976d2' }}
          >
            Get Started
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            href="/flashcards" 
            sx={{ padding: '12px 28px', borderRadius: 4 }}
          >
            Your Flashcards
          </Button>
        </Box>
      </Box>

        <Box sx={{ my: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
            Features
          </Typography>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Easy Text Input</Typography>
                <Typography sx={{ color: '#666' }}>Simply input your text and let our software do the rest. Creating flashcards has never been easier!</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Smart Flashcards</Typography>
                <Typography sx={{ color: '#666' }}>Our AI intelligently breaks down your text into concise flashcards, perfect for studying!</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Accessible Anywhere</Typography>
                <Typography sx={{ color: '#666' }}>Access your flashcards from any device, at any time. Study on the go with ease now right here!</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>Pricing</Typography>
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{
                  p: 4,
                  border: '2px solid',
                  borderColor: 'grey.300',
                  borderRadius: 4,
                  backgroundColor: '#fafafa',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-8px)' },
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Basic</Typography>
                <Typography variant="h6" gutterBottom>$5/month</Typography>
                <Typography sx={{ color: '#666' }}>Access to basic flashcard features and limited storage.</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 3, borderRadius: 4 }} onClick={() => handleSubmit('basic')}>
                  Choose Basic
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{
                  p: 4,
                  border: '2px solid',
                  borderColor: 'grey.300',
                  borderRadius: 4,
                  backgroundColor: '#fafafa',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-8px)' },
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Pro</Typography>
                <Typography variant="h6" gutterBottom>$10/month</Typography>
                <Typography sx={{ color: '#666' }}>Unlimited flashcards and storage, with priority support.</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 3, borderRadius: 4 }} onClick={() => handleSubmit('pro')}>
                  Choose Pro
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#212121', color: '#fff' }}>
        <Typography variant="body2">© {new Date().getFullYear()} CardQuest. All rights reserved.</Typography>
      </Box>
    </Box>
  );
}
