<script>
    import Navbar from '../components/Navbar.svelte';
    import { onMount } from 'svelte'

    let users = [];
    const url = 'http://localhost:8000/api/users/';

    const getUsers = async ()=>{
        try{
            const response = await fetch(url);
            users = await response.json();
        } catch (error){
            console.error('Error fetching users:', error);
        }
    }

    onMount(()=>{
        getUsers();
    });
</script>

<Navbar />

<h1>USERS</h1>

{#each users as user}
    <div>
        <h2>{user.user}</h2>
        <h2>{user.fullname}</h2>
        <p>{user.email}</p>
        <a href="/{user.id}/">Ver perfil</a>
    </div>
{/each}