<script>
    import Navbar from '../../../components/Navbar.svelte';
    import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

    export let data;
    let user = '';
    let fullname = '';
    let email = '';
    let password = '';

    let id = data.id;

    let userPREV;

    let validFields = () => {
        return user.trim().length > 0 && fullname.trim().length > 3 && email.trim().length > 5 && password.trim().length > 2;
    };

    let handleSubmit = async () => {
        if (!validFields()) {
            alert('Campos inválidos');
            return;
        }
        const trimmedUser = user.trim();
        const trimmedFullname = fullname.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        const data = {
            email: trimmedEmail,
            password: trimmedPassword,
            fullname: trimmedFullname,
            user: trimmedUser
        };

        const url = `http://localhost:8000/api/user/${id}`;

        try {
            const opciones = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            const response = await fetch(url, opciones);

            if (response.ok) {
                const responseData = await response.json();
                // console.log('Respuesta recibida:', responseData);
                goto('/');
            } else {
                throw new Error('Error en la llamada AJAX');
            }
        } catch (error) {
            console.error('Error:', error);
        }

    };

    onMount(async function(){
        const url = `http://localhost:8000/api/users/${data.id}`;
        let response = await fetch(url);
        if (response.ok) {
            userPREV = await response.json();
            user = userPREV.user;
            fullname = userPREV.fullname;
            email = userPREV.email;
            password = userPREV.password;
        } else {
            console.error('Error fetching user:', response.status);
        }
    })
</script>

<Navbar />

<h2>Create User</h2>

<form on:submit|preventDefault={handleSubmit}>
    <div class="">
        <label for="user">User</label>
        <input bind:value={user} type="text" id="user" placeholder="User">
    </div>
    <br>
    <div class="">
        <label for="fullname">Full Name</label>
        <input bind:value={fullname} type="text" id="fullname" placeholder="Full Name">
    </div>
    <br>
    <div class="">
        <label for="email">Email</label>
        <input bind:value={email} type="email" id="email" placeholder="Email">
    </div>
    <br>
    <div class="">
        <label for="password">Password</label>
        <input bind:value={password} type="password" id="password" placeholder="Password">
    </div>
    <br>
    <button type="submit">Create User</button>
</form>