import Link from "next/link";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
export default function NotFound() {
  return (
    <Container className="section">
      <div className="empty-state">
        <span className="empty-icon">
          <Icon name="search" size={32} />
        </span>
        <span className="eyebrow">۴۰۴ · اینجا خبری نیست</span>
        <h1>این فضا را پیدا نکردیم.</h1>
        <p>ممکن است آدرس تغییر کرده باشد. یک جای خوب دیگر پیدا کنیم؟</p>
        <Link href="/spaces" className="button button-primary">
          برگشت به فضاها
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </Container>
  );
}
