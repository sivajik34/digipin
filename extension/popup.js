document.getElementById("fetch").addEventListener("click", async () => {
  const digipin = document.getElementById("digipin").value.trim();
  if (!digipin) return alert("Please enter a DIGIPIN");
  try {
    const res = await fetch(`http://localhost:8000/api/address?digipin=${digipin}`);
    const data = await res.json();
    const preview = `
      <strong>Address:</strong> ${data.full_address}<br>
      <strong>City:</strong> ${data.city}<br>
      <strong>State:</strong> ${data.state}<br>
      <strong>PIN:</strong> ${data.pincode}<br>
      <strong>Country:</strong> ${data.country}
    `;
    document.getElementById("preview").innerHTML = preview;
    document.getElementById("preview").style.display = "block";
    window.digipinData = data;
  } catch (err) {
    alert("Failed to fetch address");
  }
});

document.getElementById("fill").addEventListener("click", () => {
  const data = window.digipinData;
  if (!data) return alert("Please preview address first");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (data) => {
        const fill = (selectorList, value) => {
          for (const sel of selectorList) {
            const el = document.querySelector(sel);
            if (el) {
              el.focus();
              el.value = value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              break;
            }
          }
        };

        fill(["input[name*='address']", "textarea[name*='address']", "input[placeholder*='Address']"], data.full_address);
        fill(["input[name*='city']", "input[placeholder*='City']"], data.city);
        fill(["input[name*='state']", "input[placeholder*='State']", "select[name*='state']"], data.state);
        fill(["input[name*='zip']", "input[name*='pin']", "input[placeholder*='Pincode']"], data.pincode);
        fill(["input[name*='country']", "select[name*='country']"], data.country);
      },
      args: [data],
    });
  });
});