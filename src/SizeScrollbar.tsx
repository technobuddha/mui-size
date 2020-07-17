import React                from 'react';
import throttle             from 'lodash.throttle';
import Box, { BoxProps }    from '@material-ui/core/Box';

const getScrollbarSize = () => {
    const node = document.createElement('div');
    node.setAttribute('style', 'width: 100px; height: 100px; position: absolute; top: -1000000px; overflow: scroll;');  
    document.body.appendChild(node);

    const scrollbarWidth    = node.offsetWidth - node.clientWidth;
    const scrollbarHeight   = node.offsetHeight - node.clientHeight;

    document.body.removeChild(node);

    return { scrollbarWidth, scrollbarHeight }
}

export type SizeScrollbarRenderProps = { width: number, height: number, scrollbarWidth: number, scrollbarHeight: number };
export type SizeScrollbarProps       = Omit<BoxProps, 'children'> & {children: (state: SizeScrollbarRenderProps) => React.ReactNode}

export const SizeScrollbar: React.FC<SizeScrollbarProps> = (props: SizeScrollbarProps) => {
    const [ state, setState ]   = React.useState<SizeScrollbarRenderProps>({ width: 0, height: 0, scrollbarHeight: 0, scrollbarWidth: 0 });
    const div                   = React.useRef<HTMLDivElement>(null);

    const measure = () => {
        return { width: div.current?.offsetWidth || 0, height: div.current?.offsetHeight || 0, ...getScrollbarSize() } as SizeScrollbarRenderProps;
    }

    React.useEffect(
        () => {
            const handleResize = throttle(() => setState(measure()), 166); // 10 frames at 60 Hz
            window.addEventListener('resize', handleResize);
            div.current?.addEventListener('resize', handleResize);
            setState(measure());

            return (() => {
                handleResize.cancel();
                window.removeEventListener('resize', handleResize);
                div.current?.removeEventListener('reisze', handleResize);
            });
        },
        []
    )

    const { children, ...boxProps } = props;
    return (
        //@ts-ignore 
        <Box {...boxProps} component="div" ref={div}>
            {(
                (state.width === 0 || state.height === 0)
                ?   ''
                :   children(measure())
            )}
        </Box>
    );
}

export default SizeScrollbar;
