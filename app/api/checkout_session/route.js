import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const formatAmountForStripe = (amount) => {
    return Math.round(amount * 100);
};

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams;
    const session_id = searchParams.get('session_id');

    try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
        return NextResponse.json(checkoutSession);
    } catch (error) {
        console.error('Error retrieving checkout session', error);
        return NextResponse.json({ error: { message: error.message } }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { plan } = await req.json(); 

        let priceData;

        if (plan === 'pro') {
            priceData = {
                currency: 'usd',
                product_data: {
                    name: 'Pro Subscription',
                },
                unit_amount: formatAmountForStripe(10),
                recurring: {
                    interval: 'month',
                    interval_count: 1,
                },
            };
        } else if (plan === 'basic') {
            priceData = {
                currency: 'usd',
                product_data: {
                    name: 'Basic Subscription',
                },
                unit_amount: formatAmountForStripe(5),
                recurring: {
                    interval: 'month',
                    interval_count: 1,
                },
            };
        } else {
            return NextResponse.json({ error: { message: 'Invalid plan selected' } }, { status: 400 });
        }

        const params = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: priceData,
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
        };

        const checkoutSession = await stripe.checkout.sessions.create(params);

        return NextResponse.json(checkoutSession, {
            status: 200,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return new NextResponse(JSON.stringify({ error: { message: error.message } }), {
            status: 500,
        });
    }
}
