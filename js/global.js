document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  const clickedDetails = target.closest("details");

  document.querySelectorAll("details[open]").forEach((details) => {
    if (!clickedDetails || details !== clickedDetails) {
      details.open = false;
    }
  });
});
