const shareUrl = typeof window !== "undefined" ? window.location.href : "";

function ShareOption({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center gap-2
        p-4 rounded-xl
        border hover:bg-gray-50
      "
    >
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}


const copyLink = async () => {
  await navigator.clipboard.writeText(shareUrl);
  alert("Link copied!");
};

const shareWhatsApp = () => {
  window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`);
};

const shareFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
};

const shareTwitter = () => {
  window.open(`https://twitter.com/intent/tweet?url=${shareUrl}`);
};

const shareEmail = () => {
  window.location.href = `mailto:?subject=Check this place&body=${shareUrl}`;
};




export { shareUrl, copyLink, shareWhatsApp, shareFacebook, shareTwitter, shareEmail ,ShareOption };