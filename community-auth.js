// Community Authentication and Database Interaction

// Initialize Supabase Client
const supabaseUrl = 'https://haqylpxmjxlfhicaldrp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcXlscHhtanhsZmhpY2FsZHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODY2OTQsImV4cCI6MjA1OTI2MjY5NH0.K9JOcocrquk_IwGu1LK0hNLKDRPyygXjpwGop4LfKlU';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Handle Profile Form Submission
document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const city = document.getElementById('city').value;
    const country = document.getElementById('country').value;
    const bio = document.getElementById('bio').value;
    const facebookUrl = document.querySelector('input[name="facebook"]').value;
    const instagramUrl = document.querySelector('input[name="instagram"]').value;
    const tiktokUrl = document.querySelector('input[name="tiktok"]').value;
    const whatsappNumber = document.querySelector('input[name="whatsapp"]').value;
    const photoUrl = document.getElementById('editProfilePic').src; // Assuming the image is already uploaded and displayed

    const { data, error } = await supabase
        .from('users')
        .insert([
            { full_name: fullName, city, country, bio, facebook_url: facebookUrl, instagram_url: instagramUrl, tiktok_url: tiktokUrl, whatsapp_number: whatsappNumber, photo_url: photoUrl }
        ]);

    if (error) {
        console.error('Error inserting data:', error);
        alert('There was an error saving your profile. Please try again.');
    } else {
        alert('Profile saved successfully!');
    }
}); 