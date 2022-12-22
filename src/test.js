import { Spec } from './app.js';

let root = document.getElementById('root');

let page = <div>

    <div class='1'>1

        <div class='2'>2
            <div class='4'>4
                <div class='5'>5
                </div>

                <div class='6'>6

                </div>

            </div>

        </div>

        <div class='3'>3

        </div>

    </div>

</div>

Spec.render(page, root);