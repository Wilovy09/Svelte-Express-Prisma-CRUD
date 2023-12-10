<script>
    import Navbar from '../../components/Navbar.svelte';
    import { onMount } from 'svelte'

    export let data;
    let user;
    
    
    onMount(async function(){
        const url = `http://localhost:8000/api/users/${data.id}`;
        let response = await fetch(url);
        if (response.ok){
            user = await response.json();
        } else {
            console.error('Error fetching user:', response.status);
        }
    })
    
</script>

<Navbar />

<h1>USER</h1>

{#if user}
    <div>
        <h2>{user.user}</h2>
        <h2>{user.fullname}</h2>
        <p>{user.email}</p>
        <a href="/{user.id}/updateUser/">Editar perfil</a>
        <a href="/{user.id}/deleteUser/">Eliminar perfil</a>
    </div>
{/if}