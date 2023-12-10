<script>
    import { onMount } from 'svelte'
    import { goto } from '$app/navigation';
    
    export let data;

    onMount(async ()=>{
        try {
            const url = `http://localhost:8000/api/user/${data.id}`;
            const opciones = {method: 'DELETE',};
            const response = await fetch(url, opciones);

            if (response.ok) {
                const responseData = await response.json();
                goto('/');
            } else {
                throw new Error('Error en la llamada AJAX');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    })
</script>