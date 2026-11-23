import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/BrandIcons";
import { SITE_NAME, facebookUrl, fullAddress, instagramUrl, mapsUrl, waNumber } from "@/lib/site";
import InstallApp from "./InstallApp";
import s from "./menu.module.css";

export default function SiteFooter({ datos }) {
  const ig = instagramUrl(datos.redes.instagram);
  const fb = facebookUrl(datos.redes.facebook);
  const wa = waNumber(datos.whatsapp);
  const name = datos.nombre || SITE_NAME;

  return (
    <footer className={s.footer}>
      <img src="/logo-sm.webp" alt="" width={56} height={56} loading="lazy" className={s.footerLogo} />
      <p className={s.footerName}>{name}</p>
      {datos.direccion ? (
        <a className={s.footerLink} href={mapsUrl(datos.direccion)} target="_blank" rel="noopener noreferrer">
          {fullAddress(datos.direccion)}
        </a>
      ) : null}
      <div className={s.footerSocial}>
        {wa.length > 3 ? (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <WhatsAppIcon size={22} />
          </a>
        ) : null}
        {ig ? (
          <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <InstagramIcon size={22} />
          </a>
        ) : null}
        {fb ? (
          <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FacebookIcon size={22} />
          </a>
        ) : null}
      </div>
      <InstallApp />
    </footer>
  );
}
