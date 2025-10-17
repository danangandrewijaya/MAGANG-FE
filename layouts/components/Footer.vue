<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center d-inline-block text-body-1 text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      Made With
      <VIcon
        icon="bx-bxs-heart"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
        href="https://themeselection.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Themeselection</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 #text-primary">
      <p
        class="text-muted #text-center"
        style="font-size: 11px; opacity: 0.5;"
      >
        <b>Version</b>: {{ appVersion.commit }}<br>
        <b>Build date</b>: {{ appVersion.buildDate }}
      </p>
    </span>
  </div>
</template>
