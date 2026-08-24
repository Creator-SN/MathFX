<template>
	<div class="subscription-container" :class="[{ dark: theme === 'dark' }]">
		<div class="s-row" style="justify-content: space-between">
			<p class="s-title">{{ local("Subscription") }}</p>
			<fv-button
				:theme="theme"
				background="linear-gradient(128deg, rgba(50, 187, 245, 0.85), rgba(27, 96, 147, 0.85))"
				foreground="white"
				borderRadius="18"
				style="width: 100px"
				:title="local('Add API')"
				@click="addInfo"
			>
				<i class="ms-Icon ms-Icon--Add"></i>
				<span style="margin-left: 6px">{{ local("Add API") }}</span>
			</fv-button>
		</div>
		<div class="scroll-view">
			<div
				class="s-block"
				:class="[{ choosen: cur_sub === s.name }]"
				v-for="(s, index) in s_list"
				:key="index"
				@click="curChoosen(s)"
			>
				<div class="s-1">
					<img class="s-logo" :src="s.url" alt="" />
					<p class="s-api-title">{{ displayName(s.name) }}</p>
					<div
						v-for="(item, i) in itemOfName(s.name)?.data || []"
						:key="index + '.' + i"
						class="s-info-row"
						@click="$event.stopPropagation()"
					>
						<p class="st-1">{{ item.name }}:</p>
						<fv-roll-text
							v-show="!s.revise"
							class="st-2"
							mode="loop"
							>{{ item.value }}</fv-roll-text
						>
						<fv-text-box
							v-show="s.revise"
							v-model="item.value"
							:placeholder="`Input Your ${item.name}`"
							:theme="theme"
							:background="
								theme === 'dark' ? 'rgba(0, 0, 0, 1)' : ''
							"
							borderRadius="6"
							:revealBorder="true"
							:isBoxShadow="true"
							style="margin-left: 15px"
						></fv-text-box>
					</div>
				</div>
				<div class="s-control-block" @click="$event.stopPropagation()">
					<fv-button
						:theme="theme"
						fontSize="12"
						:background="s.revise ? 'rgba(0, 201, 145, 1)' : ''"
						borderRadius="50"
						style="width: 30px; height: 30px"
						:title="local('Edit')"
						@click="reviseInfo(s)"
					>
						<i
							class="ms-Icon"
							:class="[
								`ms-Icon--${s.revise ? 'CheckMark' : 'Edit'}`,
							]"
						></i>
					</fv-button>
					<fv-button
						:theme="'dark'"
						fontSize="12"
						background="rgba(173, 38, 45, 1)"
						borderRadius="50"
						style="width: 30px; height: 30px; margin-left: 5px"
						:title="local('Clear')"
						@click="clearInfo(s)"
					>
						<i class="ms-Icon ms-Icon--StrokeErase"></i>
					</fv-button>
					<fv-button
						:theme="'dark'"
						fontSize="12"
						background="rgba(173, 38, 45, 1)"
						borderRadius="50"
						style="width: 30px; height: 30px; margin-left: 5px"
						:title="local('Delete')"
						@click="deleteInfo(s)"
					>
						<i class="ms-Icon ms-Icon--Delete"></i>
					</fv-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useAppStore } from "@/stores/app.js";
import mathFXImg from "@/assets/logo.svg";

export default {
	data() {
		return {
			s_list: [{ name: "chat", url: mathFXImg, revise: false }],
		};
	},
	computed: {
		...mapState(useAppStore, {
			subscriptions: (state) => state.subscriptions,
			cur_sub: (state) => state.cur_sub,
			theme: (state) => state.theme,
		}),
		...mapState(useAppStore, ["local"]),
	},
	mounted() {
		this.syncList();
	},
	methods: {
		...mapActions(useAppStore, ["reviseSubscriptions", "reviseCurSub"]),
		itemOfName(name) {
			return (
				this.subscriptions.find((item) => item.name === name) || {
					name,
					title: name,
					data: [],
				}
			);
		},
		displayName(name) {
			const item = this.itemOfName(name);
			const customName = item?.data?.find(
				(field) => field.key === "display_name",
			)?.value;
			return customName || item?.title || name;
		},
		syncList() {
			this.s_list = this.subscriptions.map((item) => ({
				name: item.name,
				url: mathFXImg,
				revise: false,
			}));
		},
		addInfo() {
			const names = new Set(this.subscriptions.map((item) => item.name));
			let index = 1;
			let name = "chat";
			while (names.has(name)) name = `chat_${++index}`;

			const title = `Chat API ${index}`;
			this.subscriptions.push({
				name,
				title,
				data: [
					{ name: "Name", key: "display_name", value: title },
					{ name: "Base URL", key: "base_url", value: "" },
					{ name: "API Key", key: "api_key", value: "" },
					{ name: "Model", key: "model", value: "" },
					{
						name: "Reasoning Effort",
						key: "reasoning_effort",
						value: "medium",
					},
				],
			});
			this.reviseSubscriptions({
				v: this,
				subscriptions: this.subscriptions,
			});
			this.syncList();
			const added = this.s_list.find((item) => item.name === name);
			if (added) added.revise = true;
			this.reviseCurSub({ v: this, cur_sub: name });
		},
		reviseInfo(s) {
			if (!s.revise) {
				s.revise = true;
				return 0;
			}
			this.reviseSubscriptions({
				v: this,
				subscriptions: this.subscriptions,
			});
			s.revise = false;
		},
		clearInfo(s) {
			this.$infoBox(
				`${this.local(
					"Make sure to clear all information under this subscription",
				)}?`,
				{
					status: "warning",
					title: `${this.local("Clear Info")}`,
					theme: this.theme,
					confirm: () => {
						let item = this.itemOfName(s.name);
						item.data.forEach((el, index) => {
							item.data[index].value = "";
						});
						this.reviseSubscriptions({
							v: this,
							subscriptions: this.subscriptions,
						});
					},
					cancel: () => {},
				},
			);
		},
		deleteInfo(s) {
			this.$infoBox(`${this.local("Delete this subscription")}?`, {
				status: "warning",
				title: this.local("Delete"),
				theme: this.theme,
				confirm: () => {
					const index = this.subscriptions.findIndex(
						(item) => item.name === s.name,
					);
					if (index < 0) return;
					this.subscriptions.splice(index, 1);
					this.reviseSubscriptions({
						v: this,
						subscriptions: this.subscriptions,
					});
					this.syncList();
					if (this.cur_sub === s.name) {
						this.reviseCurSub({
							v: this,
							cur_sub: this.subscriptions[0]?.name || "",
						});
					}
				},
				cancel: () => {},
			});
		},
		curChoosen(s) {
			this.reviseCurSub({
				v: this,
				cur_sub: s.name,
			});
		},
	},
};
</script>

<style lang="scss">
.subscription-container {
	position: relative;
	width: 100%;
	height: 100%;
	background: linear-gradient(
		160deg,
		rgba(157, 198, 228, 0.6),
		rgba(157, 198, 228, 0.1),
		rgba(255, 255, 255, 1),
		rgba(255, 255, 255, 1),
		rgba(255, 255, 255, 1),
		rgba(255, 255, 255, 1),
		rgba(255, 255, 255, 1)
	);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	transition: all 0.3s;

	&.dark {
		background: linear-gradient(
			150deg,
			rgba(17, 34, 46, 1),
			rgba(0, 0, 0, 1),
			rgba(0, 0, 0, 1),
			rgba(0, 0, 0, 1)
		);

		.s-title {
			color: whitesmoke;
		}

		.scroll-view {
			.s-block {
				background: rgba(20, 20, 20, 1);

				&:hover {
					border: rgba(118, 185, 237, 0.3) solid 2px;
				}

				&.choosen {
					border: rgba(118, 185, 237, 0.6) solid 2px;
					background: linear-gradient(
						150deg,
						rgba(17, 34, 46, 1),
						rgba(0, 0, 0, 1),
						rgba(0, 0, 0, 1)
					);
				}

				.s-api-title {
					color: whitesmoke;
				}
				.s-info-row {
					.st-1 {
						color: whitesmoke;
						background: rgba(26, 26, 26, 1);
					}

					.st-2 {
						color: whitesmoke;
						background: rgba(50, 50, 50, 1);
					}
				}

				.s-control-block {
					background: rgba(0, 0, 0, 1);
				}
			}
		}
	}

	.s-row {
		position: relative;
		margin: 25px 0px;
		padding: 0px 15px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.s-title {
		font-size: 24px;
		user-select: none;
		cursor: default;
	}

	.scroll-view {
		position: relative;
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: auto;

		.s-block {
			position: relative;
			width: 100%;
			min-height: 230px;
			flex: 0 0 auto;
			margin-bottom: 15px;
			background: white;
			border: rgba(0, 90, 158, 0) solid 2px;
			border-radius: 8px;
			box-sizing: border-box;
			overflow: hidden;
			box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.1);
			transition: all 0.3s;

			&:hover {
				border: rgba(0, 90, 158, 0.3) solid 2px;
			}

			&.choosen {
				border: rgba(0, 90, 158, 0.6) solid 2px;
				background: linear-gradient(
					160deg,
					rgba(157, 198, 228, 0.6),
					rgba(157, 198, 228, 0.1),
					rgba(255, 255, 255, 1),
					rgba(255, 255, 255, 1),
					rgba(255, 255, 255, 1),
					rgba(255, 255, 255, 1)
				);
			}

			.s-1 {
				padding: 25px 15px;
				box-sizing: border-box;
				transition: all 0.3s;
			}

			.s-logo {
				width: 30px;
				height: auto;
			}

			.s-api-title {
				margin: 8px 0px;
				font-size: 16px;
				font-weight: bold;
				color: rgba(50, 49, 48, 1);
			}

			.s-info-row {
				margin: 5px 0px;
				display: flex;
				align-items: center;
				transition: all 0.3s;

				.st-1 {
					min-width: 66px;
					height: 32px;
					padding: 0px 6px;
					font-size: 12px;
					background: rgba(250, 250, 250, 1);
					color: rgba(10, 38, 59, 1);
					box-sizing: border-box;
					border-radius: 3px;
					display: flex;
					align-items: center;
					transition: all 0.3s;
				}

				.st-2 {
					@include nowrap;

					height: 32px;
					flex: 1;
					margin-left: 15px;
					padding: 0px 8px;
					background: rgba(240, 240, 240, 1);
					font-size: 12px;
					color: rgba(50, 49, 48, 1);
					border-radius: 3px;
					display: flex;
					align-items: center;
					transition: all 0.3s;
				}
			}

			.s-control-block {
				position: relative;
				width: 100%;
				min-height: 50px;
				height: 50px;
				padding: 5px 10px;
				background: whitesmoke;
				box-sizing: border-box;
				display: flex;
				align-items: center;
			}
		}
	}
}
</style>
