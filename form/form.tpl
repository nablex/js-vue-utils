<template id="n-form">
	<form v-on:submit.prevent>
		<header>
			<slot name="header"></slot>
		</header>
		<section>
			<slot></slot>
		</section>
		<footer>
			<slot name="footer"></slot>
		</footer>
	</form>
</template>