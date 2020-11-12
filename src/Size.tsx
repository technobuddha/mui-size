import React                from 'react';
import throttle             from 'lodash.throttle';
import Box, { BoxProps }    from '@material-ui/core/Box';

export type SizeRenderProps = { width: number, height: number };
export type SizeProps       = Omit<BoxProps, 'children'> & {children: (state: SizeRenderProps) => React.ReactNode}

export const Size: React.FC<SizeProps> = (props: SizeProps) => {
    const [ state, setState ]   = React.useState<SizeRenderProps>({ width: 0, height: 0 });
    const div                   = React.useRef<HTMLDivElement>(null);

    const measure = () => {
        return { width: div.current?.offsetWidth || 0, height: div.current?.offsetHeight || 0 };
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
                div.current?.removeEventListener('resize', handleResize);
            });
        },
        []
    )

    const { children, ...boxProps } = props;
    return (
        // @ts-ignore ref is missing from the typescript definition for the Box node
        <Box {...boxProps} component="div" ref={div}>
            {(
                (state.width === 0 || state.height === 0)
                ?   '\u00A0'
                :   children(measure())
            )}
        </Box>
    );
}

export default Size;
