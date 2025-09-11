1:installing/initializing
npx supabase init
npx supabase functions new hello

2:To check version
supabase --version

1. Create the function
supabase functions new hello-js

2. Test it locally
supabase functions serve hello-js
Now your function will be available locally at:
(example) http://localhost:54321/functions/v1/hello-js

You should see:
Hello from JavaScript Edge Function!

3. Deploy it to Supabase
supabase functions deploy hello-js

4. Access the deployed function
After deploy, you’ll get a URL like:
https://<your-project-ref>.functions.supabase.co/hello-js
