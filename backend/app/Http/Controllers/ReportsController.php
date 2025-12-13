<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function usersReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Email']);

            $users = DB::table('User')->get();
            foreach ($users as $u) {
                fputcsv($file, [
                    $u->user_ID,
                    $u->user_name,
                    $u->user_email,
                ]);
            }

            fclose($file);
        }, 'users_report.csv', ['Content-Type' => 'text/csv']);
    }

    public function donationsReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Donation ID', 'Donor ID', 'Charity ID', 'Donation Date', 'Total Items']);

            $donations = DB::table('Donation')->get();

            foreach ($donations as $d) {
                // Count items from Donation_Item
                $itemsCount = DB::table('Donation_Item')
                    ->where('donation_ID', $d->donation_ID)
                    ->count();

                // Fallback to total_items in Donation if no items exist
                if ($itemsCount === 0 && isset($d->total_items)) {
                    $itemsCount = $d->total_items;
                }

                fputcsv($file, [
                    $d->donation_ID,
                    $d->donor_ID,
                    $d->charity_ID,
                    $d->donation_date,
                    $itemsCount,
                ]);
            }

            fclose($file);
        }, 'donations_report.csv', ['Content-Type' => 'text/csv']);
    }
    public function charitiesReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Charity ID', 'Name', 'Contact', 'Email', 'Address', 'Total Donations', 'Total Items']);

            $charities = DB::table('Charity')->get();

            foreach ($charities as $c) {
                $donationsReceived = DB::table('Donation')
                    ->where('charity_ID', $c->charity_ID)
                    ->get();

                $totalDonations = $donationsReceived->count();

                // Count all items per charity (fallback to total_items if Donation_Item empty)
                $totalItems = 0;
                foreach ($donationsReceived as $d) {
                    $count = DB::table('Donation_Item')
                        ->where('donation_ID', $d->donation_ID)
                        ->count();
                    if ($count === 0 && isset($d->total_items)) {
                        $count = $d->total_items;
                    }
                    $totalItems += $count;
                }

                fputcsv($file, [
                    $c->charity_ID,
                    $c->charity_name,
                    $c->contact_person,
                    $c->charity_email,
                    $c->charity_address,
                    $totalDonations,
                    $totalItems,
                ]);
            }

            fclose($file);
        }, 'charity_report.csv', ['Content-Type' => 'text/csv']);
    }

    public function sustainabilityReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Total CO₂ Reduced (kg)']);

            $donations = DB::table('Donation')->get();
            $totalItems = 0;

            foreach ($donations as $d) {
                $count = DB::table('Donation_Item')
                    ->where('donation_ID', $d->donation_ID)
                    ->count();
                if ($count === 0 && isset($d->total_items)) {
                    $count = $d->total_items;
                }
                $totalItems += $count;
            }

            $totalCO2 = $totalItems * 1.5;
            fputcsv($file, [$totalCO2]);

            fclose($file);
        }, 'sustainability_report.csv', ['Content-Type' => 'text/csv']);
    }
}
