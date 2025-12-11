<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OpenAIController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->input('question');

        $client = \OpenAI::client(env('OPENAI_API_KEY'));

        $faqContext = "
        FAQ for LetUsDonate:
        1. What makes LetUsDonate Different?
        - Eco-friendly donations.
        - Choose collection or drop-off.
        - Track your impact.

        2. What can I donate?
        - Clothing, shoes, handbags, belts, etc.

        3. How do I book a collection?
        - Create account.
        - Fill donation form.
        - Choose date/time/location.

        4. How much goes to charity?
        - 100% of profits go to chosen charity.
        ";

        $response = $client->chat()->create([
            'model' => 'gpt-4.2-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful FAQ bot.'],
                ['role' => 'system', 'content' => $faqContext],
                ['role' => 'user', 'content' => $question],
            ],
        ]);

        return response()->json([
            'answer' => $response->choices[0]->message->content,
        ]);
    }
}
