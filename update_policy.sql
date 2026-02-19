-- Allow public read access to diagnostic results for demo purposes
create policy "Allow public read access" on public.diagnostic_results for select using (true);
