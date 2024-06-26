import { fail, redirect } from '@sveltejs/kit'
import { error } from '@sveltejs/kit';
import * as dotenv from 'dotenv'
import OpenAI from "openai";
import { QdrantClient } from '@qdrant/js-client-rest';
dotenv.config()

const client = new QdrantClient({
    url: process.env.QDRANT_HOST,
    apiKey: process.env.QDRANT_API_KEY,
});
const collectionName = "products"
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY_2 || ''
});

let userNow: any;
export const load = async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()

    if (!session) {
        throw redirect(303, '/')
    }
    const {
        data: { user }
    } = await supabase.auth.getUser();
    // console.log(user);


    let { data: userdetails, error: err } = await supabase
        .from('userdetails')
        .select("*")
        .eq('email', user.email)
    console.log(err);
    userNow = userdetails[0];


    let { data: cart, error: err2 } = await supabase
        .from('cart')
        .select("*")
        .eq('uid', userNow.id)


    let itemCount = cart?.length;




    return { userNow, itemCount };
}

export const actions = {

    deleteCartItem: async ({ url, locals: { supabase, getSession } }) => {
        const productid = url.searchParams.get("id")


        if (!productid) {
            return fail(400, { message: "Invalid request" })
        }

        const { error: err } = await supabase
            .from('cart')
            .delete()
            .eq("pid", productid)
            .eq("uid", userNow.id)

        if (err) console.log(err)
        else throw redirect(303, '/auth/cart');

    },

    audio: async ({ request, locals: { supabase, getSession } }) => {
        console.log("HERE")
        const formData = (await request.formData()) as any;
        const audioFile = formData.get('audioFile');
        const textQ = formData.get('textquery');
        const image = formData.get('image');
        // console.log(textQ);
        // console.log(image);
        // console.log(audioFile);

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            response_format: 'text'
        });


        console.log("text holo ", textQ);
        console.log("image holo ", image);

        console.log(transcription);
        return {
            success: "done",
            text: transcription
        }

        // return new Response(
        //     JSON.stringify({
        //         success: "done",
        //         text: transcription
        //     })
        // );
    }


}