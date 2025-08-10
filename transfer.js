// ====== Supabase Client Setup ======
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = 'YOUR_PUBLIC_ANON_KEY';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ====== Transfer Logic ======
async function transferBenzcoin(senderId, receiverId, amount) {
  // Step 1: Get sender balance
  let { data: sender, error: senderError } = await supabaseClient
    .from('users')
    .select('balance')
    .eq('id', senderId)
    .single();

  if (senderError) throw new Error("Error fetching sender balance.");
  if (sender.balance < amount) throw new Error("Not enough Benzcoin, bro.");

  // Step 2: Start transaction (update balances)
  const { error: senderUpdateError } = await supabaseClient
    .from('users')
    .update({ balance: sender.balance - amount })
    .eq('id', senderId);

  const { data: receiver, error: receiverError } = await supabaseClient
    .from('users')
    .select('balance')
    .eq('id', receiverId)
    .single();

  if (receiverError) throw new Error("Receiver not found.");

  const { error: receiverUpdateError } = await supabaseClient
    .from('users')
    .update({ balance: receiver.balance + amount })
    .eq('id', receiverId);

  if (senderUpdateError || receiverUpdateError) {
    throw new Error("Transfer failed, bro.");
  }

  alert(`💸 Sent ${amount} Benzcoin to ${receiverId}!`);
}

// ====== Form Handling ======
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('transferForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      alert("You need to be signed in to send Benzcoin.");
      return;
    }

    const senderId = user.id;
    const receiverId = document.getElementById('receiverId').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);

    try {
      await transferBenzcoin(senderId, receiverId, amount);
    } catch (err) {
      alert(err.message);
    }
  });
});
