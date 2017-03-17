<template id="n-form-text">
	<div class="n-form n-form-inline n-form-text">
		<input @input="updateValue" type="text" v-model="value"/>
		<span v-if="required" class="n-form-required"></span>
		<slot name="messages" messages="messages">
		</slot>
	</div>
</template>