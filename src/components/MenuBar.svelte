<script lang="ts">
</script>

<header id="primary">
    <div class="left">
        <div class="control">
            <img class="logo" src="logo/ico.48x48.png" alt="">
        </div>
    </div>
    <div class="right">
        <div class="control">
            <img class="avatar" src="avatar.png" alt="">
        </div>
    </div>
</header>

<style>
	header#primary {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    header#primary > .left,
    header#primary > .right {
        flex: 0 0 auto;
        line-height: 4rem;
        height: 4rem;
    }

    .control {
        padding: 0.5rem;
    }

    img.logo {
        width: 3rem;
        height: 3rem;
    }

    img.avatar {
        width: 2.5rem;
        height: 2.5rem;
        margin: 0.25rem;
        background: rgba(255, 255, 255, 0.125);
        border-radius: 50%;
    }
</style>
