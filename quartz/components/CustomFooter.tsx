import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
  showQuartzCredit?: boolean
  customText?: string
}

export default ((opts?: Options) => {
  const CustomFooter: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    const showQuartzCredit = opts?.showQuartzCredit ?? false
    const customText = opts?.customText ?? `© ${year}`
    
    return (
      <footer class={`${displayClass ?? ""}`}>
        {showQuartzCredit ? (
          <p>
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz</a> © {year}
          </p>
        ) : (
          <p>{customText}</p>
        )}
        {Object.keys(links).length > 0 && (
          <ul>
            {Object.entries(links).map(([text, link]) => (
              <li>
                <a href={link}>{text}</a>
              </li>
            ))}
          </ul>
        )}
      </footer>
    )
  }

  CustomFooter.css = style
  return CustomFooter
}) satisfies QuartzComponentConstructor

