<script>
	// import './styles.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import 'tailwindcss/tailwind.css';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<div>
	<main>
		<slot />
	</main>
</div>

<style>
</style>
