import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
    }

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const user = users.find(u => u.email === email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Add admin role
    const { error } = await supabase.from('user_roles').insert({
      user_id: user.id,
      role: 'admin',
    });

    if (error && !error.message.includes('duplicate')) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
